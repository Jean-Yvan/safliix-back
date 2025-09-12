import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import {
  CreateSerieHandler,
  UpdateSerieHandler,
  DeleteSerieHandler,
  ListSeriesHandler,
  FindSerieByIdHandler,
  AddSeasonHandler,
  UpdateSeasonHandler,
  DeleteSeasonHandler,
  AddEpisodeHandler,
  UpdateEpisodeHandler,
  DeleteEpisodeHandler,
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
  ListSerieQuery,
} from '@safliix-back/series';

@ApiTags('Series')
@Controller('series')
export class AdminSerieController {
  constructor(
    private readonly createSerieHandler: CreateSerieHandler,
    private readonly listSerieHandler: ListSeriesHandler,
    private readonly addSeasonHandler: AddSeasonHandler,
    private readonly addEpisodeHandler: AddEpisodeHandler,
    private readonly uSerieHandler: UpdateSerieHandler,
    private readonly uEpisodeHandler: UpdateEpisodeHandler,
    private readonly uSeasonHandler: UpdateSeasonHandler,
    private readonly dSerieHandler: DeleteSerieHandler,
    private readonly dEpisodeHandler: DeleteEpisodeHandler,
    private readonly dSeasonHandler: DeleteSeasonHandler,
    private readonly fSerieHandler: FindSerieByIdHandler,
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
  async list() {
    const query = new ListSerieQuery();
    const result = await this.listSerieHandler.execute(query);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return { success: true, data: result.unwrap() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get serie by ID' })
  @ApiParam({ name: 'id', type: String })
  async findById(@Param('id') id: string) {
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
}
