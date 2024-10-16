import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserPayload } from 'src/global/@types';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';

@ApiTags('statistics')
@ApiBearerAuth('access_token')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // @Get('projects/net-profit/desc')
  // async projectsOrderedByNetProfitDesc() {
  //   return await this.statisticsService.projectsOrderedByNetProfitDesc();
  // }
  // @Get('projects/net-profit/asc')
  // async projectsOrderedByNetProfitAsc() {
  //   return await this.statisticsService.projectsOrderedByNetProfitAsc();
  // }

  @Get('')
  async companyStatistics(@userMetaDate() userPayload: UserPayload) {
    const companyStatistics = await this.statisticsService.companyStatistics(
      userPayload.company,
    );
    const salesGroupByDay = await this.statisticsService.salesGroupByDay(
      userPayload.company,
    );
    return {
      company: {
        ...companyStatistics,
        netProfit: companyStatistics.actualPrice - companyStatistics.actualCost,
      },
      salesGroupByDay,
    };
  }

  // @Get('projects/forecasted-cost/desc')
  // async projectsOrderedByForecastedCostDesc() {
  //   return await this.statisticsService.projectsOrderedByForecastedCostDesc();
  // }
  // @Get('projects/forecasted-cost/asc')
  // async projectsOrderedByForecastedCostAsc() {
  //   return await this.statisticsService.projectsOrderedByForecastedCostAsc();
  // }

  // @Get('projects/actual-cost/desc')
  // async projectsOrderedByActualCostDesc() {
  //   return await this.statisticsService.projectsOrderedByActualCostDesc();
  // }
  // @Get('projects/actual-cost/asc')
  // async projectsOrderedByActualCostAsc() {
  //   return await this.statisticsService.projectsOrderedByActualCostAsc();
  // }

  // @Get('projects/forecasted-price/desc')
  // async projectsOrderedByForecastedPriceDesc() {
  //   return await this.statisticsService.projectsOrderedByForecastedPriceDesc();
  // }
  // @Get('projects/forecasted-price/asc')
  // async projectsOrderedByForecastedPriceAsc() {
  //   return await this.statisticsService.projectsOrderedByForecastedPriceAsc();
  // }

  // @Get('projects/actual-price/desc')
  // async projectsOrderedByActualPriceDesc() {
  //   return await this.statisticsService.projectsOrderedByActualPriceDesc();
  // }
  // @Get('projects/actual-price/asc')
  // async projectsOrderedByActualPriceAsc() {
  //   return await this.statisticsService.projectsOrderedByActualPriceAsc();
  // }

  // @Get('projects/accounts-payable/desc')
  // async projectsOrderedByAccountsPayableDesc() {
  //   return await this.statisticsService.projectsOrderedByAccountsPayableDesc();
  // }
  // @Get('projects/accounts-payable/asc')
  // async projectsOrderedByAccountsPayableAsc() {
  //   return await this.statisticsService.projectsOrderedByAccountsPayableAsc();
  // }

  // @Get('projects/accounts-receivable/desc')
  // async projectsOrderedByAccountsReceivableDesc() {
  //   return await this.statisticsService.projectsOrderedByAccountsReceivableDesc();
  // }
  // @Get('projects/accounts-receivable/asc')
  // async projectsOrderedByAccountsReceivableAsc() {
  //   return await this.statisticsService.projectsOrderedByAccountsReceivableAsc();
  // }

  // @Get('pos/total-sales/desc')
  // async posOrderedBySalesDesc() {
  //   return await this.statisticsService.posOrderedBySalesDesc();
  // }
  // @Get('pos/total-sales/asc')
  // async posOrderedBySalesAsc() {
  //   return await this.statisticsService.posOrderedBySalesAsc();
  // }
}
