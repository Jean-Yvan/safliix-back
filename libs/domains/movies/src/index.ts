export * from './lib/movies.module';
export * from './lib/domain/entities/movie.aggregate';
export * from './lib/domain/ports/movie.repository';
export * from './lib/application/commands/create-movie.command';
export * from  './lib/interface/rest/dto/create-movie.dto';
export * from './lib/application/handlers/create-movie.handler';
export * from './lib/application/handlers/delete-movie.handler';
export * from './lib/application/handlers/update-movie.handler';
export * from './lib/application/handlers/get-movies.handler';

export * from './lib/mappers/create-movie.mapper';

