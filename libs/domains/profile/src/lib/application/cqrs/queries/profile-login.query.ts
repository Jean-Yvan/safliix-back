import { IQuery } from "@nestjs/cqrs";

export class ProfileLoginQuery implements IQuery {
  constructor(
    public readonly ownerEmail: string, // ID du User interne (résolu par l'orchestrateur)
    public readonly profileName: string,
    public readonly pinCode: number,
  ) {}
}