// domain/value-objects/password.vo.ts
import * as bcrypt from "bcryptjs"
import { Result, Ok,Err } from 'oxide.ts'; 


export class Password {
  private constructor(private readonly hash: string) {}

  // Crée un mot de passe hashé depuis un mot de passe en clair
  static async create(raw: string): Promise<Result<Password,Error>> {
    try{
      const hash = await bcrypt.hash(raw, 10);
      return Ok(new Password(hash));
    }catch(e){
      return Err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Restaurer depuis la DB (hash existant)
  static restore(hash: string): Password {
    return new Password(hash);
  }

  // Vérifier le mot de passe
  async compare(raw: string): Promise<boolean> {
    return bcrypt.compare(raw, this.hash);
  }

  // Récupérer le hash pour la persistance
  get value(): string {
    return this.hash;
  }
}
