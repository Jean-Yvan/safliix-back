import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreatePurchaseCommand,
  CreatePurchaseDto,
  DeletePurchaseCommand,
  FindPurchaseByUserAndVideoQuery,
  ListExpiredPurchasesQuery,
  ListPurchaseByIdQuery,
  ListPurchasesByUserQuery,
  ListPurchasesQuery,
  UpdatePurchaseCommand,
  UpdatePurchaseDto,
} from '@safliix-back/access';

@ApiTags('Purchase')
@Controller('purchase')
export class ClientPurchaseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une location' })
  @ApiResponse({ status: 201, description: 'Location créée' })
  async create(@Body() dto: CreatePurchaseDto) {
    const result = await this.commandBus.execute(
      new CreatePurchaseCommand(dto)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Put()
  @ApiOperation({ summary: 'Mettre à jour une location' })
  @ApiResponse({ status: 200, description: 'Location mise à jour' })
  async update(@Body() dto: UpdatePurchaseDto) {
    const result = await this.commandBus.execute(
      new UpdatePurchaseCommand(dto)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une location' })
  @ApiParam({ name: 'id', description: 'Identifiant de la location' })
  @ApiResponse({ status: 200, description: 'Location supprimée' })
  async delete(@Param('id') id: string) {
    const result = await this.commandBus.execute(
      new DeletePurchaseCommand(id)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les locations' })
  @ApiResponse({ status: 200, description: 'Liste des locations' })
  async listAll() {
    const result = await this.queryBus.execute(new ListPurchasesQuery());

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('expired')
  @ApiOperation({ summary: 'Lister les locations expirées' })
  @ApiResponse({ status: 200, description: 'Liste des locations expirées' })
  async listExpired() {
    const result = await this.queryBus.execute(
      new ListExpiredPurchasesQuery()
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lister les locations par utilisateur' })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Locations trouvées' })
  async listByUser(@Param('userId') userId: string) {
    const result = await this.queryBus.execute(
      new ListPurchasesByUserQuery(userId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/video/:videoId')
  @ApiOperation({
    summary: 'Vérifier la location disponible pour un utilisateur et une vidéo',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiParam({ name: 'videoId', description: 'Identifiant de la vidéo' })
  @ApiResponse({ status: 200, description: 'Location correspondante' })
  async findByUserAndVideo(
    @Param('userId') userId: string,
    @Param('videoId') videoId: string
  ) {
    const result = await this.queryBus.execute(
      new FindPurchaseByUserAndVideoQuery(userId, videoId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: "Récupérer une location par son identifiant" })
  @ApiParam({ name: 'id', description: 'Identifiant de la location' })
  @ApiResponse({ status: 200, description: 'Location trouvée' })
  async listById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new ListPurchaseByIdQuery(id));

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }
}
