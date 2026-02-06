import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Obter visão geral do dashboard' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Obter atividades recentes' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
