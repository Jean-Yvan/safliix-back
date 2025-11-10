// src/videos/domain/entities/active-stream.entity.ts

import { Result, Ok, Err } from "oxide.ts";

export class ActiveStream {
  private constructor(
    public readonly id: string | undefined,
    public readonly profileId: string,
    public readonly accountId: string,
    public readonly videoId: string,
    public readonly startedAt: Date,
    public readonly expiresAt: Date,
    public readonly updatedAt: Date | null
  ) {}

  /**
   * Restaure l'entité depuis les données de la base de données.
   */
  static restore(data: any): ActiveStream {
    return new ActiveStream(
      data.id,
      data.profileId,
      data.accountId,
      data.videoId,
      data.startedAt,
      data.expiresAt,
      data.updatedAt
    );
  }

  /**
   * Met à jour l'entité pour prolonger la durée de vie du stream (le "ping").
   * @param timeoutMinutes Le nombre de minutes à ajouter à l'expiration actuelle.
   */
  updateExpiration(timeoutMinutes: number): ActiveStream {
    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + timeoutMinutes);

    // Retourne une NOUVELLE instance de l'entité (principe d'immutabilité)
    return new ActiveStream(
      this.id,
      this.profileId,
      this.accountId,
      this.videoId,
      this.startedAt,
      newExpiresAt,
      new Date() // Mise à jour de l'horodatage
    );
  }
}