// Application layer barrel for video tracking CQRS

// Commands
export * from './application/cqrs/commands/create-user-video-view.command';
export * from './application/cqrs/commands/update-user-video-progress.command';
export * from './application/cqrs/commands/mark-user-video-view-as-completed.command';
export * from './application/cqrs/commands/rate-user-video-view.command';
export * from './application/cqrs/commands/delete-user-video-view.command';
export * from './application/cqrs/commands/update-user-video-progress-batch.command';
export * from './application/cqrs/commands/mark-multiple-views-as-completed.command';

// Queries
export * from './application/cqrs/queries/get-user-video-view-by-id.query';
export * from './application/cqrs/queries/get-user-video-views-by-user-and-video.query';
export * from './application/cqrs/queries/get-user-video-progress.query';
export * from './application/cqrs/queries/get-watch-history.query';
export * from './application/cqrs/queries/get-completed-views.query';
export * from './application/cqrs/queries/get-in-progress-views.query';
export * from './application/cqrs/queries/get-video-statistics.query';
export * from './application/cqrs/queries/get-user-watch-time.query';
export * from './application/cqrs/queries/get-recent-views.query';

// Handlers
export * from './application/handlers/create-user-video-view.handler';
export * from './application/handlers/update-user-video-progress.handler';
export * from './application/handlers/mark-user-video-view-as-completed.handler';
export * from './application/handlers/rate-user-video-view.handler';
export * from './application/handlers/delete-user-video-view.handler';
export * from './application/handlers/update-user-video-progress-batch.handler';
export * from './application/handlers/mark-multiple-views-as-completed.handler';
export * from './application/handlers/get-user-video-view-by-id.handler';
export * from './application/handlers/get-user-video-views-by-user-and-video.handler';
export * from './application/handlers/get-user-video-progress.handler';
export * from './application/handlers/get-watch-history.handler';
export * from './application/handlers/get-completed-views.handler';
export * from './application/handlers/get-in-progress-views.handler';
export * from './application/handlers/get-video-statistics.handler';
export * from './application/handlers/get-user-watch-time.handler';
export * from './application/handlers/get-recent-views.handler';

// DTOs
export { CreateUserVideoViewDto } from './interfaces/dto/create-user-video-view.dto';

export * from './interfaces/dto/some.dto';
