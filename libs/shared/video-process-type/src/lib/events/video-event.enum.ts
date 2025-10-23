// events/video-events.enum.ts
export enum VideoEvents {
  VIDEO_EVENT = 'video.event', // événement générique (optionnel)
  VIDEO_INGEST = 'video.ingest',             // entrée (clé S3)
  VIDEO_DOWNLOADED = 'video.downloaded',     // localPath prêt
  VIDEO_SPLITTED = 'video.splitted',         // parts créées
  VIDEO_PART_READY = 'video.part.ready',     // une part prête (optionnel)
  VIDEO_SEGMENTED = 'video.segmented',       // toutes les parts encodées
  VIDEO_PLAYLIST_ASSEMBLED = 'video.playlist.assembled',
  VIDEO_PROGRESS = 'video.progress',         // mise à jour de progression
  VIDEO_PROCESSING_FAILED = 'video.processing.failed',
  VIDEO_ASSEMBLY_DONE = 'video.assembly.done' // tout est prêt (optionnel)
}

export enum VideoQueues {
  VIDEO_QUEUE = 'video.queue', // événement générique (optionnel)
  VIDEO_INGEST_QUEUE = 'video.ingest.queue',             // entrée (clé S3)
  VIDEO_DOWNLOADED_QUEUE = 'video.downloaded.queue',     // localPath prêt
  VIDEO_SPLITTED_QUEUE = 'video.splitted.queue',         // parts créées
  VIDEO_PART_READY_QUEUE = 'video.part.ready.queue',     // une part prête (optionnel)
  VIDEO_SEGMENTED_QUEUE = 'video.segmented.queue',       // toutes les parts encodées
  VIDEO_PLAYLIST_ASSEMBLED_QUEUE = 'video.playlist.assembled.queue',
  VIDEO_PROGRESS_QUEUE = 'video.progress.queue',         // mise à jour de progression
  VIDEO_PROCESSING_FAILED_QUEUE = 'video.processing.failed.queue',
  VIDEO_ASSEMBLY_DONE_QUEUE = 'video.assembly.done.queue' // tout est prêt (optionnel)
}
