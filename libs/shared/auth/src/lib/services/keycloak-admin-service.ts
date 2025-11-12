import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

interface RoleMapping {
  id: string;
  name: string;
}

@Injectable()
export class KeycloakProvisioningService {
  private readonly logger = new Logger(KeycloakProvisioningService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly realm: string;
  private readonly keycloakBaseUrl: string;
  private readonly adminRealmBaseUrl: string;
  private readonly tokenUrl: string;
  private readonly rolePropagationDelayMs: number;
  private adminToken: string | null = null;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.clientId = this.getRequiredConfig('KEYCLOAK_PROVISIONER_CLIENT_ID', 'KEYCLOAK_CLIENT_ID');
    this.clientSecret = this.getRequiredConfig(
      'KEYCLOAK_PROVISIONER_CLIENT_SECRET',
      'KEYCLOAK_CLIENT_SECRET',
    );
    this.realm = this.getRequiredConfig('KEYCLOAK_REALM');
    this.keycloakBaseUrl = this.stripTrailingSlash(
      this.getRequiredConfig('KEYCLOAK_BASE_URL', 'KEYCLOAK_URL'),
    );
    this.adminRealmBaseUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}`;
    this.tokenUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    this.rolePropagationDelayMs =
      Number(this.config.get('KEYCLOAK_ROLE_PROPAGATION_DELAY_MS')) || 200;
  }

  private getRequiredConfig(...keys: string[]): string {
    for (const key of keys) {
      const value = this.config.get<string>(key);
      if (value) {
        return value;
      }
    }
    throw new Error(`Missing Keycloak configuration. Tried keys: ${keys.join(', ')}`);
  }

  private stripTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private buildAdminUrl(path: string): string {
    return `${this.adminRealmBaseUrl}${path}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logAxiosError(context: string, error: unknown): void {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 'NO_STATUS';
      const data = error.response?.data;
      this.logger.error(
        `${context} - Keycloak responded with status ${status} and body ${JSON.stringify(data)}`,
      );
    } else if (error instanceof Error) {
      this.logger.error(`${context} - ${error.message}`, error.stack);
    } else {
      this.logger.error(`${context} - ${JSON.stringify(error)}`);
    }
  }

  // --- Vérification du Token ---

  
  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const decoded = this.decodeJwt<{ exp: number }>(token);
      if (!decoded || !decoded.exp) return true;

      // Laisser une marge de sécurité de 30 secondes (30000 ms)
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();

      return expiryTime < (now + 30000);
    } catch (e) {
      this.logger.error('Erreur lors du décodage du jeton admin. Forçage du renouvellement.', e);
      return true;
    }
  }

  private decodeJwt<T>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];

      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = Buffer.from(padded, 'base64').toString('utf8');
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  protected async getAdminToken(): Promise<string> {
    // 1. Vérifie si le token en cache existe ET n'est pas expiré.
    if (this.adminToken && !this.isTokenExpired(this.adminToken)) {
      return this.adminToken;
    }

    // 2. Demande un nouveau token (Client Credentials Flow).
    try {
      this.logger.log('Renouvellement du jeton d\'administration Keycloak...');
      
      const body = `grant_type=client_credentials&client_id=${encodeURIComponent(
        this.clientId,
      )}&client_secret=${encodeURIComponent(this.clientSecret)}`;
      
      const response = (await firstValueFrom(
        this.http.post<{ access_token: string }>(this.tokenUrl, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      )) as AxiosResponse<{ access_token: string }>;

      this.adminToken = response.data.access_token;
      return this.adminToken;

    } catch (error) {
      this.logAxiosError('Échec de la récupération du jeton d\'administration Keycloak', error);
      throw new InternalServerErrorException('Impossible de s\'authentifier auprès de Keycloak.');
    }
  }

  // --- Logique d'Assignation des Rôles ---

  private async getRealmRolesMap(
    roleNames: string[],
    adminToken: string,
    requiredRoles: string[] = [],
  ): Promise<RoleMapping[]> {
    if (!roleNames.length) {
      return [];
    }

    const results = (await Promise.allSettled(
      roleNames.map((name) =>
        firstValueFrom(
          this.http.get(this.buildAdminUrl(`/roles/${encodeURIComponent(name)}`), {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        ),
      ),
    )) as PromiseSettledResult<AxiosResponse<any>>[];

    const rolesMap: RoleMapping[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const roleName = roleNames[i];

      if (result.status === 'fulfilled') {
        const { id, name } = result.value.data;
        rolesMap.push({ id, name });
      } else {
        const isRequired = requiredRoles.includes(roleName);
        if (isRequired) {
          this.logAxiosError(`Rôle critique introuvable : ${roleName}`, result.reason);
          throw new InternalServerErrorException(`Rôle obligatoire introuvable : ${roleName}`);
        } else {
          this.logger.warn(`Rôle facultatif ignoré : ${roleName}`);
        }
      }
    }
    return rolesMap;
  }

  // --- Fonction Principale ---

  public async createUser(
    userData: { email: string; password?: string; firstName?: string; lastName?: string },
    roles: string[],
    requiredRoles: string[] = [],
  ): Promise<string> {
    const token = await this.getAdminToken();

    // 1. Création de l'utilisateur
    const userPayload = {
      ...userData,
      enabled: true,
      emailVerified: false,
      credentials: userData.password ? [{ type: 'password', value: userData.password, temporary: false }] : [],
    };

    let userId: string;
    try {
      const creationResponse = (await firstValueFrom(
        this.http.post<any>(this.buildAdminUrl('/users'), userPayload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      )) as AxiosResponse<any>;

      // Le statut 201 est attendu, l'ID est dans le header Location
      const locationHeader =
        creationResponse.headers['location'] ?? creationResponse.headers['Location'];
      userId = locationHeader?.split('/').pop() || creationResponse.data?.id;
      
      if (!userId) {
        this.logger.error('Création utilisateur réussie (201) mais ID manquant dans le header Location.');
        throw new InternalServerErrorException('Échec de l\'extraction de l\'ID utilisateur.');
      }
      this.logger.log(`Utilisateur créé avec l'ID: ${userId}`);

    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        this.logger.warn(
          `Utilisateur déjà existant dans Keycloak pour l'email ${userData.email}.`,
        );
        throw new ConflictException('Utilisateur déjà présent dans l\'annuaire externe.');
      }

      this.logAxiosError('Échec de la création utilisateur Keycloak.', error);
      throw new InternalServerErrorException('Échec de la création utilisateur externe.');
    }
    
    // 2. --- DÉLAI ET ASSIGNATION DES RÔLES (Correction du 403) ---
    
    // ** AJOUT DU DÉLAI ** pour contourner la latence de la DB Keycloak
    this.logger.debug(
      `Attente de ${this.rolePropagationDelayMs} ms pour la synchronisation DB Keycloak...`,
    );
    await this.delay(this.rolePropagationDelayMs);
    
    try {
        const rolesToAssign = await this.getRealmRolesMap(roles, token, requiredRoles);
        
        if (rolesToAssign.length > 0) {
            this.logger.debug(`Assignation des rôles à l'utilisateur ${userId}. Payload: ${JSON.stringify(rolesToAssign)}`);
            const roleMappingUrl = this.buildAdminUrl(`/users/${userId}/role-mappings/realm`);

            await firstValueFrom(
                this.http.post(roleMappingUrl, rolesToAssign, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
            );
            this.logger.log(`Rôles assignés avec succès à ${userId}.`);
        }
        
    } catch (error) {
        this.logAxiosError('Échec de l\'assignation des rôles Keycloak.', error);
        throw new InternalServerErrorException('Échec de l\'assignation des rôles externes.');
    }

    return userId;
  }
}
