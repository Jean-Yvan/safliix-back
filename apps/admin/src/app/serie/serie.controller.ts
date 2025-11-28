import {
  Body,
  BadRequestException,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Prisma, PrismaService } from '@safliix-back/database';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { randomUUID } from 'crypto';
import { S3Service } from '@safliix-back/s3';

import {
  CreateSerieHandler,
  UpdateSerieHandler,
  DeleteSerieHandler,
  FindSerieByIdHandler,
  AddSeasonHandler,
  UpdateSeasonHandler,
  DeleteSeasonHandler,
  AddEpisodeHandler,
  UpdateEpisodeHandler,
  DeleteEpisodeHandler,
  FindEpisodebyIdHandler,
  FindEpisodeByIdQuery,
  CreateSerieDto,
  AddSeasonDto,
  AddEpisodeDto,
  UpdateSeasonDto,
  UpdateSerieDto,
  UpdateEpisodeDto,
  AddEpisodeCommand,
  AddSeasonCommand,
  CreateSerieCommand,
  DeleteEpisodeCommand,
  DeleteSeasonCommand,
  DeleteSerieCommand,
  UpdateEpisodeCommand,
  UpdateSeasonCommand,
  UpdateSerieCommand,
  FindSerieByIdQuery,
} from '@safliix-back/series';

class SerieListQueryDto {
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

@ApiTags('Series')
@Controller('series')
export class AdminSerieController {
  constructor(
    private readonly createSerieHandler: CreateSerieHandler,
    private readonly addSeasonHandler: AddSeasonHandler,
    private readonly addEpisodeHandler: AddEpisodeHandler,
    private readonly uSerieHandler: UpdateSerieHandler,
    private readonly uEpisodeHandler: UpdateEpisodeHandler,
    private readonly uSeasonHandler: UpdateSeasonHandler,
    private readonly dSerieHandler: DeleteSerieHandler,
    private readonly dEpisodeHandler: DeleteEpisodeHandler,
    private readonly dSeasonHandler: DeleteSeasonHandler,
    private readonly fSerieHandler: FindSerieByIdHandler,
    private readonly fEpisodeByIdHandler: FindEpisodebyIdHandler,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  // ------------------- SERIES -------------------

  @Post()
  @ApiOperation({ summary: 'Create a new serie' })
  @ApiBody({ type: CreateSerieDto })
  @ApiResponse({ status: 201, description: 'Serie created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createSerie(@Body() dto: CreateSerieDto) {
    const command = new CreateSerieCommand(dto);
    const result = await this.createSerieHandler.execute(command);

    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return { success: true, data: result.unwrap() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update serie by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSerieDto })
  async update(@Param('id') id: string, @Body() dto: UpdateSerieDto) {
    const command = new UpdateSerieCommand({ ...dto, id });
    const result = await this.uSerieHandler.execute(command);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return { success: true, data: result.unwrap() };
  }

  @Get()
  @ApiOperation({ summary: 'List all series with filters' })
  async list(@Query() filters: SerieListQueryDto) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
    const where: Prisma.SerieWhereInput = {};
    const metadataWhere: Prisma.VideoMetadataWhereInput = {};

    if (filters.search) {
      metadataWhere.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      metadataWhere.category = {
        category: { equals: filters.category, mode: 'insensitive' },
      } as Prisma.VideoCategoryWhereInput;
    }
    if (Object.keys(metadataWhere).length > 0) {
      where.metadata = { is: metadataWhere };
    }

    const [totalItems, series] = await Promise.all([
      this.prisma.serie.count({ where }),
      this.prisma.serie.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          metadata: { include: { category: true } },
          seasons: true,
          attachment: { include: { mediaFile: true } },
        },
      }),
    ]);

    const items = series.map((serie) => ({
      id: serie.id,
      title: serie.metadata.title,
      status: serie.status,
      director: serie.metadata.director,
      dp: null,
      number: serie.seasons.length,
      category: serie.metadata.category?.category,
      poster: serie.metadata.thumbnailUrl,
      hero: serie.metadata.secondaryImage,
      stats: {},
      stars: [],
      geo: [],
      donut: {},
    }));

    return {
      success: true,
      data: {
        items,
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
  @ApiOperation({ summary: 'Liste des options pour séries' })
  async metaOptions() {
    const [categories, formats, genres, actors] = await Promise.all([
      this.prisma.videoCategory.findMany(),
      this.prisma.videoFormat.findMany(),
      this.prisma.videoGenre.findMany(),
      this.prisma.actor.findMany(),
    ]);

    return {
      success: true,
      data: { categories, formats, genres, actors },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get serie by ID' })
  @ApiParam({ name: 'id', type: String })
  async findById(@Param('id') id: string) {
    const serie = await this.prisma.serie.findUnique({
      where: { id },
      include: {
        metadata: { include: { category: true, format: true, gender: true } },
        seasons: {
          include: {
            episodes: true,
          },
        },
      },
    });

    if (serie) {
      return {
        success: true,
        data: {
          id: serie.id,
          title: serie.metadata.title,
          status: serie.status,
          category: serie.metadata.category?.category,
          director: serie.metadata.director,
          poster: serie.metadata.thumbnailUrl,
          hero: serie.metadata.secondaryImage,
          synopsis: serie.metadata.description,
          seasons: serie.seasons.map((s) => ({
            id: s.id,
            number: s.number,
            title: `Saison ${s.number}`,
            poster: null,
            episodesCount: s.episodes.length,
          })),
          stats: {},
        },
      };
    }

    const query = new FindSerieByIdQuery(id);
    const result = await this.fSerieHandler.execute(query);
    if (result.isErr()) throw result.unwrapErr();
    return { success: true, data: result.unwrap() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete serie by ID' })
  @ApiParam({ name: 'id', type: String })
  async deleteSerieById(@Param('id') id: string) {
    const command = new DeleteSerieCommand(id);
    const result = await this.dSerieHandler.execute(command);
    if (result.isErr()) throw result.unwrapErr();
    return { success: true };
  }

  // ------------------- SEASONS -------------------

  @Post(':serieId/seasons')
  @ApiOperation({ summary: 'Add new season to serie' })
  @ApiParam({ name: 'serieId', type: String })
  @ApiBody({ type: AddSeasonDto })
  async addSeason(@Param('serieId') seriesId: string, @Body() dto: AddSeasonDto) {
    const command = new AddSeasonCommand({ ...dto, seriesId });
    const result = await this.addSeasonHandler.execute(command);

    if (result.isErr()) {
      throw result.unwrapErr();
    }
    return { success: true, data: result.unwrap() };
  }

  @Put('seasons/:id')
  @ApiOperation({ summary: 'Update season by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateSeasonDto })
  async updateSeason(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    const command = new UpdateSeasonCommand({ ...dto, id });
    const result = await this.uSeasonHandler.execute(command);

    if (result.isErr()) throw result.unwrapErr();
    return { success: true, data: result.unwrap() };
  }

  @Delete('seasons/:id')
  @ApiOperation({ summary: 'Delete season by ID' })
  @ApiParam({ name: 'id', type: String }) 
  async deleteSeason(@Param('id') id: string) {
    const command = new DeleteSeasonCommand(id);
    const result = await this.dSeasonHandler.execute(command);
    if (result.isErr()) throw result.unwrapErr();
    return { success: true };
  }

  // ------------------- EPISODES -------------------

  @Post('seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Add new episode to season' })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiBody({ type: AddEpisodeDto })
  async addEpisode(
    @Param('seasonId') seasonId: string,
    @Body() dto: AddEpisodeDto,
  ) {
    const command = new AddEpisodeCommand({ ...dto, seasonId });
    const result = await this.addEpisodeHandler.execute(command);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return { success: true, data: result.unwrap() };
  }

  // Alias with serieId in path (spec convenience)
  @Post(':id/seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Add new episode to season (with serieId in path)' })
  async addEpisodeWithSerie(
    @Param('seasonId') seasonId: string,
    @Body() dto: AddEpisodeDto,
  ) {
    const command = new AddEpisodeCommand({ ...dto, seasonId });
    const result = await this.addEpisodeHandler.execute(command);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return { success: true, data: result.unwrap() };
  }

  @Put('episodes/:id')
  @ApiOperation({ summary: 'Update episode by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateEpisodeDto })
  async updateEpisode(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    const command = new UpdateEpisodeCommand({ ...dto, id });
    const result = await this.uEpisodeHandler.execute(command);

    if (result.isErr()) throw result.unwrapErr();
    return { success: true, data: result.unwrap() };
  }

  @Delete('episodes/:id')
  @ApiOperation({ summary: 'Delete episode by ID' })
  @ApiParam({ name: 'id', type: String })
  async deleteEpisode(@Param('id') id: string) {
    const command = new DeleteEpisodeCommand(id);
    const result = await this.dEpisodeHandler.execute(command);
    if (result.isErr()) throw result.unwrapErr();
    return { success: true };
  }

  // ------------------- EXTRA ENDPOINTS -------------------

  @Get('search')
  @ApiOperation({ summary: 'Recherche de séries' })
  async search(@Query('query') query: string) {
    if (!query) return { success: true, data: [] };
    const results = await this.prisma.serie.findMany({
      where: { metadata: { is: { title: { contains: query, mode: 'insensitive' } } } },
      take: 10,
      select: { id: true, metadata: { select: { title: true } } },
    });
    return {
      success: true,
      data: results.map((s) => ({ id: s.id, title: s.metadata.title })),
    };
  }

  @Get(':id/seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Lister les épisodes dune saison' })
  async listEpisodes(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeRaw) || 10));

    const [totalItems, episodes] = await Promise.all([
      this.prisma.episode.count({ where: { seasonId } }),
      this.prisma.episode.findMany({
        where: { seasonId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { number: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        items: episodes,
        pageInfo: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
        },
      },
    };
  }

  @Get('episodes/:episodeId')
  @ApiOperation({ summary: 'Récupérer un épisode' })
  async getEpisode(@Param('episodeId', ParseUUIDPipe) episodeId: string) {
    const query = new FindEpisodeByIdQuery(episodeId);
    const result = await this.fEpisodeByIdHandler.execute(query);
    if (result.isErr()) throw result.unwrapErr();
    return { success: true, data: result.unwrap() };
  }

  @Post(':id/uploads/presign')
  @ApiOperation({ summary: 'Pré-signe des uploads pour une série' })
  async presignSerieUploads(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadRequestDto,
  ) {
    if (!dto.files?.length) {
      throw new BadRequestException('files is required');
    }
    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        const key = this.s3.buildObjectKey(
          'series',
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
  @ApiOperation({ summary: 'Finalise des uploads pour une série' })
  async finalizeSerieUploads(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { uploads: { key: string; finalUrl: string }[] },
  ) {
    if (!body?.uploads?.length) {
      throw new BadRequestException('uploads is required');
    }
    return { success: true, data: { ok: true, resourceId: id } };
  }

  @Post(':id/seasons/:seasonId/uploads/presign')
  @ApiOperation({ summary: 'Pré-signe des uploads pour une saison' })
  async presignSeasonUploads(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Body() dto: UploadRequestDto,
  ) {
    if (!dto.files?.length) {
      throw new BadRequestException('files is required');
    }
    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        const key = this.s3.buildObjectKey(
          'series',
          id,
          'seasons',
          seasonId,
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

  @Post(':id/seasons/:seasonId/uploads/finalize')
  @ApiOperation({ summary: 'Finalise les uploads de saison' })
  async finalizeSeasonUploads(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Body() body: { uploads: { key: string; finalUrl: string }[] },
  ) {
    if (!body?.uploads?.length) {
      throw new BadRequestException('uploads is required');
    }
    return { success: true, data: { ok: true, resourceId: seasonId } };
  }

  @Post('episodes/:episodeId/uploads/presign')
  @ApiOperation({ summary: 'Pré-signe des uploads pour un épisode' })
  async presignEpisodeUploads(
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: UploadRequestDto,
  ) {
    if (!dto.files?.length) {
      throw new BadRequestException('files is required');
    }
    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        const key = this.s3.buildObjectKey(
          'episodes',
          episodeId,
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

  @Post('episodes/:episodeId/uploads/finalize')
  @ApiOperation({ summary: 'Finalise les uploads épisode' })
  async finalizeEpisodeUploads(
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() body: { uploads: { key: string; finalUrl: string }[] },
  ) {
    if (!body?.uploads?.length) {
      throw new BadRequestException('uploads is required');
    }
    return { success: true, data: { ok: true, resourceId: episodeId } };
  }
}
