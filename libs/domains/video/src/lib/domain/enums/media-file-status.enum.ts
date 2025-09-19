// libs/domains/shared/video-file/src/lib/enums/video-file-status.enum.ts
export enum MediaFileStatus {
  PENDING,          // En attente de traitement
  UPLOADED,        // Uploadé mais pas encore traité
  PROCESSING,    // En cours de traitement
  PROCESSED,      // Traitement terminé avec succès
  FAILED,            // Échec du traitement
  CANCELLED,      // Traitement annulé
  QUEUED,            // Dans la file d'attente
}

// Helper pour les statuts terminaux
export const TERMINAL_STATUSES = [
  MediaFileStatus.PROCESSED,
  MediaFileStatus.FAILED, 
  MediaFileStatus.CANCELLED
];

// Helper pour vérifier si un statut est terminal
export function isTerminalStatus(status: MediaFileStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}