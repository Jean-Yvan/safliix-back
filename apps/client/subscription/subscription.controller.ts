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
  CreateSubscriptionCommand,
  CreateSubscriptionDto,
  DeleteSubscriptionCommand,
  IsUserSubscribedToPlanQuery,
  ListActiveSubscriptionByUserQuery,
  ListExpiredSubscriptionsQuery,
  ListSubscriptionByIdQuery,
  UpdateSubscriptionCommand,
  UpdateSubscriptionDto,
} from '@safliix-back/access';

@ApiTags('Subscription')
@Controller('subscription')
export class ClientSubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un abonnement' })
  @ApiResponse({ status: 201, description: 'Abonnement créé' })
  async create(@Body() dto: CreateSubscriptionDto) {
    const result = await this.commandBus.execute(
      new CreateSubscriptionCommand(dto)
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
  @ApiOperation({ summary: 'Mettre à jour un abonnement' })
  @ApiResponse({ status: 200, description: 'Abonnement mis à jour' })
  async update(@Body() dto: UpdateSubscriptionDto) {
    const result = await this.commandBus.execute(
      new UpdateSubscriptionCommand(dto)
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
  @ApiOperation({ summary: 'Supprimer un abonnement' })
  @ApiParam({ name: 'id', description: "Identifiant de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Abonnement supprimé' })
  async delete(@Param('id') id: string) {
    const result = await this.commandBus.execute(
      new DeleteSubscriptionCommand(id)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/active')
  @ApiOperation({ summary: 'Récupérer les abonnements actifs dun utilisateur' })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Abonnements actifs' })
  async listActiveByUser(@Param('userId') userId: string) {
    const result = await this.queryBus.execute(
      new ListActiveSubscriptionByUserQuery(userId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('user/:userId/plan/:planId/status')
  @ApiOperation({
    summary:
      'Vérifier si un utilisateur est abonné à un plan spécifique et si son abonnement est actif',
  })
  @ApiParam({ name: 'userId', description: "Identifiant de l'utilisateur" })
  @ApiParam({ name: 'planId', description: "Identifiant du plan d'abonnement" })
  @ApiResponse({ status: 200, description: 'Statut retourné' })
  async isSubscribed(
    @Param('userId') userId: string,
    @Param('planId') planId: string
  ) {
    const result = await this.queryBus.execute(
      new IsUserSubscribedToPlanQuery(userId, planId)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get('expired')
  @ApiOperation({ summary: 'Lister les abonnements expirés' })
  @ApiResponse({ status: 200, description: 'Abonnements expirés' })
  async listExpired() {
    const result = await this.queryBus.execute(
      new ListExpiredSubscriptionsQuery()
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
  @ApiOperation({ summary: "Récupérer un abonnement par son identifiant" })
  @ApiParam({ name: 'id', description: "Identifiant de l'abonnement" })
  @ApiResponse({ status: 200, description: 'Abonnement trouvé' })
  async listById(@Param('id') id: string) {
    const result = await this.queryBus.execute(
      new ListSubscriptionByIdQuery(id)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }
}
