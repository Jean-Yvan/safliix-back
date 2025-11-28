import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Misc')
@Controller()
export class MiscController {
  @Get('settings')
  @ApiOperation({ summary: 'Récupère les paramètres globaux' })
  getSettings() {
    return { success: true, data: { maintenance: false, theme: 'light' } };
  }

  @Put('settings')
  @ApiOperation({ summary: 'Met à jour les paramètres globaux' })
  updateSettings(@Body() body: Record<string, unknown>) {
    return { success: true, data: body };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Liste des rapports téléchargeables' })
  listReports() {
    return { success: true, data: [] };
  }

  @Get('reports/:id/download')
  @ApiOperation({ summary: 'Téléchargement dun rapport' })
  downloadReport(@Param('id') id: string) {
    return {
      success: true,
      data: { id, url: `https://cdn.safliix.local/reports/${id}.pdf` },
    };
  }

  @Get('intro/resources')
  @ApiOperation({ summary: 'Assets de la page intro' })
  introResources() {
    return { success: true, data: [] };
  }

  @Get('payments/methods')
  @ApiOperation({ summary: 'Méthodes de paiement disponibles' })
  listPaymentMethods() {
    return {
      success: true,
      data: ['card', 'mobile_money', 'paypal'],
    };
  }

  @Get('payments/history')
  @ApiOperation({ summary: 'Historique des paiements' })
  listPayments() {
    return { success: true, data: [] };
  }
}
