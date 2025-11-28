import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateMovieHandler,
  CreateMovieDto,
  UpdateMovieHandler,
  UpdateMovieDto,
  DeleteMovieHandler,
  DeleteMovieCommand,
  UpdateMovieCommand,
  CreateMovieCommand,
  ListMovieByIdHandler,
  ListMovieByIdQuery,
} from '@safliix-back/movies';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma, PrismaService } from '@safliix-back/database';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { randomUUID } from 'crypto';
import { S3Service } from '@safliix-back/s3';

class MovieActionDto {
  @IsIn(['publish', 'pause'])
  action!: 'publish' | 'pause';
}

class UploadFileDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  type!: string;
}

class UploadRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadFileDto)
  files!: UploadFileDto[];
}

class MovieListQueryDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sort?: 'date' | 'title';
}

@ApiTags('Films')
@Controller(['admin/movies', 'films'])
export class AdminMovieController {
  constructor(
    private readonly createMovieHandler: CreateMovieHandler,
    private readonly deleteMovieHandler: DeleteMovieHandler,
    private readonly updateMovieHandler: UpdateMovieHandler,
    private readonly listByIdHandler: ListMovieByIdHandler,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() dto: CreateMovieDto) {
    const command = new CreateMovieCommand(dto);

    const result = await this.createMovieHandler.execute(command);
    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List movies with filters' })
  async list(@Query() filters: MovieListQueryDto) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
    const where: Prisma.MovieWhereInput = {};
    const metadataWhere: Prisma.VideoMetadataWhereInput = {};

    if (filters.search) {
      metadataWhere.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.status) {
      where.status = filters.status as unknown as Prisma.MovieWhereInput['status'];
    }
    if (filters.category) {
      metadataWhere.category = {
        category: { equals: filters.category, mode: 'insensitive' },
      } as Prisma.VideoCategoryWhereInput;
    }
    if (Object.keys(metadataWhere).length > 0) {
      where.metadata = { is: metadataWhere };
    }

    const [totalItems, items] = await Promise.all([
      this.prisma.movie.count({ where }),
      this.prisma.movie.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy:
          filters.sort === 'title'
            ? { metadata: { title: 'asc' } }
            : { createdAt: 'desc' },
        include: {
          metadata: { include: { category: true } },
          attachment: { include: { mediaFile: true } },
        },
      }),
    ]);

    const mapped = items.map((m) => ({
      id: m.id,
      title: m.metadata.title,
      status: m.status,
      director: m.metadata.director,
      dp: null,
      category: m.metadata.category?.category,
      poster: m.metadata.thumbnailUrl,
      hero: m.metadata.secondaryImage,
      stats: { vues: 0, revenus: 0 },
      geo: [],
      stars: [],
      donut: {},
    }));

    return {
      success: true,
      data: {
        items: mapped,
        pageInfo: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
        },
      },
    };
  }

  @Get('meta/options')
  @ApiOperation({ summary: 'Liste des options pour formulaires films' })
  async getMetaOptions() {
    const [types, categories, formats, genres, actors, metadata] = await Promise.all([
      this.prisma.movie.findMany({
        distinct: ['type'],
        select: { type: true },
        take: 50,
      }),
      this.prisma.videoCategory.findMany(),
      this.prisma.videoFormat.findMany(),
      this.prisma.videoGenre.findMany(),
      this.prisma.actor.findMany(),
      this.prisma.videoMetadata.findMany({
        select: { productionCountry: true, productionHouse: true },
        distinct: ['productionCountry', 'productionHouse'],
      }),
    ]);

    return {
      success: true,
      data: {
        types: types.map((t) => t.type),
        categories,
        formats,
        genres,
        actors,
        countries: Array.from(
          new Set(metadata.map((m) => m.productionCountry).filter(Boolean)),
        ),
        productionHouses: Array.from(
          new Set(metadata.map((m) => m.productionHouse).filter(Boolean)),
        ),
      },
    };
  }

  @Get(':id')
  @ApiOperation({summary: 'List movie based on id'})
  async listById(@Param('id') id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        metadata: { include: { category: true, format: true, gender: true } },
        attachment: { include: { mediaFile: true } },
      },
    });
    if (!movie) {
      const query = new ListMovieByIdQuery(id);
      const result = await this.listByIdHandler.execute(query);
      if (result.isErr()) {
        throw result.unwrapErr();
      }
      return { success: true, data: result.unwrap() };
    }

    const mediaFile = movie.attachment.at(0)?.mediaFile;

    return {
      success: true,
      data: {
        id: movie.id,
        title: movie.metadata.title,
        status: movie.status,
        category: movie.metadata.category?.category,
        director: movie.metadata.director,
        dp: null,
        duration: mediaFile?.duration ?? null,
        releaseDate: movie.metadata.releaseDate,
        publishDate: movie.metadata.platformDate,
        price: movie.rentalPrice ?? 0,
        poster: movie.metadata.thumbnailUrl,
        hero: movie.metadata.secondaryImage,
        synopsis: movie.metadata.description,
        stats: { vues: 0, revenus: 0 },
        activity: [],
        geo: [],
      },
    };
  }
  
  @Delete(':id')
  @ApiOperation({summary:"Delete movie based on id"})
  async delete(@Param('id') id:string){
    const command = new DeleteMovieCommand(id);
    const result = await this.deleteMovieHandler.execute(command);
    if(result.isErr()){
      throw result.unwrapErr();
    }

    return {
      success:true,
      data:result.unwrap()
    }
  }

  @Put(':id')
  @ApiOperation({summary:"Update movie based on id"})
  async update(@Param('id') id: string, @Body() dto: UpdateMovieDto){
    const command = new UpdateMovieCommand({ ...dto, id });
    const result = await this.updateMovieHandler.execute(command);
    if(result.isErr()){
      throw result.unwrapErr();
    }

    return {
      success:true,
      data:result.unwrap()
    }
  }

  @Post(':id/actions')
  @ApiOperation({ summary: 'Publier ou mettre en pause un film' })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MovieActionDto,
  ) {
    const status = dto.action === 'publish' ? 'PUBLISHED' : 'DRAFT';
    const updated = await this.prisma.movie.update({
      where: { id },
      data: {
        status,
        metadata:
          dto.action === 'publish'
            ? { update: { platformDate: new Date() } }
            : undefined,
      },
    });

    return { success: true, data: { status: updated.status } };
  }

  @Post(':id/uploads/presign')
  @ApiOperation({ summary: 'Génère des URLs de pré-signature pour un film' })
  async presignUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadRequestDto,
  ) {
    if (!dto.files?.length) {
      throw new BadRequestException('files is required');
    }

    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        const key = this.s3.buildObjectKey(
          'films',
          id,
          file.key,
          `${randomUUID()}-${file.name}`,
        );
        const { uploadUrl, finalUrl } = await this.s3.presignUpload({
          key,
          contentType: file.type,
        });
        return { key: file.key, uploadUrl, finalUrl };
      }),
    );

    return { success: true, data: uploads };
  }

  @Post(':id/uploads/finalize')
  @ApiOperation({ summary: 'Finalise les uploads pour un film' })
  async finalizeUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { uploads: { key: string; finalUrl: string }[] },
  ) {
    if (!body?.uploads?.length) {
      throw new BadRequestException('uploads is required');
    }
    // placeholder hook point for persistence if needed
    return { success: true, data: { ok: true, resourceId: id } };
  }

}
