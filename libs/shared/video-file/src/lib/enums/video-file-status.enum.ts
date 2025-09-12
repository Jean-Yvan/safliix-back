// libs/domains/shared/video-file/src/lib/enums/video-file-status.enum.ts
export enum VideoFileStatus {
  PENDING = 'PENDING',          // En attente de traitement
  UPLOADED = 'UPLOADED',        // Uploadé mais pas encore traité
  PROCESSING = 'PROCESSING',    // En cours de traitement
  PROCESSED = 'PROCESSED',      // Traitement terminé avec succès
  FAILED = 'FAILED',            // Échec du traitement
  CANCELLED = 'CANCELLED',      // Traitement annulé
  QUEUED = 'QUEUED',            // Dans la file d'attente
}

// Helper pour les statuts terminaux
export const TERMINAL_STATUSES = [
  VideoFileStatus.PROCESSED,
  VideoFileStatus.FAILED, 
  VideoFileStatus.CANCELLED
];

// Helper pour vérifier si un statut est terminal
export function isTerminalStatus(status: VideoFileStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}