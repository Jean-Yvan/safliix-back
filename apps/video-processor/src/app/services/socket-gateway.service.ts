import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FileLogger } from '../utils/logger';

// 💡 Définition de l'interface d'état pour la cohérence
interface VideoProgressState {
  stage: string;
  progress: number; // 0 à 100
  status: 'pending' | 'running' | 'completed' | 'failed';
  updatedAt: string;
  message?: string;
}

// ----------------------------------------------------------------------
// 1. La Passerelle (Gateway) - Gère les connexions et l'émission
// ----------------------------------------------------------------------

// @WebSocketGateway(PORT, OPTIONS)
@WebSocketGateway({ 
    cors: { origin: '*' }, // Permettre la connexion depuis n'importe quel domaine client (À ajuster en production!)
    namespace: 'video-progress' // Isoler les connexions de progression
})
export class ProgressGateway {
    // Référence au serveur Socket.IO pour l'émission
    @WebSocketServer()
    server!: Server;

    private readonly logger = new FileLogger(ProgressGateway.name);

    /**
     * Gère un message de test envoyé par un client (non utilisé par le backend, mais utile pour les tests)
     */
    @SubscribeMessage('ping')
    handlePing(@MessageBody() data: string): string {
        this.logger.debug(`Received ping: ${data}`);
        // Répond directement au client qui a envoyé le message
        return 'pong'; 
    }
    
    // Vous pouvez ajouter des méthodes pour gérer 'handleConnection' et 'handleDisconnect' ici
}

// ----------------------------------------------------------------------
// 2. Le Service Injectable - Facilite l'appel par d'autres services
// ----------------------------------------------------------------------

@Injectable()
export class SocketGatewayService {
    private readonly logger = new FileLogger(SocketGatewayService.name);

    // 💡 Injection de la Gateway pour accéder à l'instance 'server'
    constructor(private readonly gateway: ProgressGateway) {}

    /**
     * Émet une mise à jour de progression à un tableau de bord.
     * Les clients peuvent "s'abonner" à une clé spécifique (s3Key) ou écouter tous les événements.
     * * @param s3Key La clé unique de la vidéo (peut servir de "room" ou d'identifiant d'événement).
     * @param state L'état complet de la progression.
     */
    async emitProgressUpdate(s3Key: string, state: VideoProgressState): Promise<void> {
        if (!this.gateway.server) {
            this.logger.warn("⚠️ WebSocket Server is not yet initialized. Skipping broadcast.");
            return;
        }

        const eventName = `progress:${s3Key}`; // Exemple: 'progress:video-xyz-123'
        
        // Émission du message:
        // .emit(eventName, payload) envoie à TOUS les clients connectés au namespace 'video-progress'.
        this.gateway.server.emit(eventName, state);
        
        // 💡 Alternative: Si vous voulez une mise à jour globale pour un aperçu rapide :
        // this.gateway.server.emit('global_progress_update', { s3Key, ...state });

        this.logger.debug(`[Socket] 📡 Emitted ${eventName} with stage: ${state.stage}`);
    }

    /**
     * Méthode d'exemple pour notifier une erreur critique à tous les clients.
     */
    async emitCriticalError(s3Key: string, reason: string): Promise<void> {
        this.gateway.server.emit('critical_error', { s3Key, reason, timestamp: new Date().toISOString() });
    }
}