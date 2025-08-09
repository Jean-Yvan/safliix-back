import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from '../interface/rest/dto/create-movie.dto';
import { CreateMovieCommand } from '../application/commands/create-movie.command';
import { VideoFormat,EmptyFormatError, InvalidFormatError, DuplicateFormatError,VideoCategory } from '@safliix-back/contents';
import { Result,Err,Ok } from 'oxide.ts';
import { MissingRequiredFieldError, InvalidActorError, InvalidDurationError, MoviePremiereRequiresPriceError } from '../errors/movie.errors';

@Injectable()
export class CreateMovieMapper {
  async toDomain(
    dto: CreateMovieDto,
    existingFormats: string[] = [],
    existingCategories: string[] = []
  ): Promise<Result<CreateMovieCommand, MoviePremiereRequiresPriceError | InvalidDurationError | MissingRequiredFieldError | InvalidActorError | InvalidFormatError>> {
    
    // 1. Validation des Value Objects
    const formatResult = VideoFormat.create(dto.format, '', existingFormats);
    const categoryResult = VideoCategory.create(dto.category, existingCategories);

    if (formatResult.isErr() || categoryResult.isErr()) {
      
      return Err(
        new InvalidFormatError(
          formatResult.unwrapErr()?.message || 
          categoryResult.unwrapErr()?.message
        )
      );
    }

    // 2. Construction des paramètres pour la commande
    const commandParams = {
      movieId: uuidv4(),
      isPremiere: dto.isPremiere,
      metadata: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        releaseDate: new Date(dto.releaseDate),
        platformDate: new Date(dto.plateformDate),
        ageRating: dto.ageRating,
        thumbnailUrl: dto.thumbnailUrl,
        director: dto.director,
        productionHouse: dto.productionHouse,
        secondaryImage: dto.secondaryImageUrl,
        format: formatResult.unwrap(),
        category: categoryResult.unwrap(),
        actors: dto.actorNames.map(name => ({ name })),
      },
      videoFileUrl: dto.movieUrl,
      rentalPrice: dto.rentalPrice
    };

    // 3. Délégation de la validation à la commande
    return CreateMovieCommand.create(commandParams);
  }
}