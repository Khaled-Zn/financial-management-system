import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  //NetProfit
  // async projectsOrderedByNetProfitDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { netProfit: 'desc' },
  //   });
  // }

  async companyStatistics(companyId: number) {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: {
        accountsReceivable: true,
        accountsPayable: true,
        actualPrice: true,
        forecastedCost: true,
        forecastedPrice: true,
        actualCost: true,
      },
    });
    return company;
  }

  // async projectsOrderedByNetProfitAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { netProfit: 'asc' },
  //   });
  // }

  // //ForecastedCost
  // async projectsOrderedByForecastedCostDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { forecastedCost: 'desc' },
  //   });
  // }

  // async projectsOrderedByForecastedCostAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { forecastedCost: 'asc' },
  //   });
  // }

  // //ActualCost
  // async projectsOrderedByActualCostDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { actualCost: 'desc' },
  //   });
  // }

  // async projectsOrderedByActualCostAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { actualCost: 'asc' },
  //   });
  // }

  // //ForecastedPrice
  // async projectsOrderedByForecastedPriceDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { forecastedPrice: 'desc' },
  //   });
  // }

  // async projectsOrderedByForecastedPriceAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { forecastedPrice: 'asc' },
  //   });
  // }

  // //ActualPrice
  // async projectsOrderedByActualPriceDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { actualPrice: 'desc' },
  //   });
  // }

  // async projectsOrderedByActualPriceAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { actualPrice: 'asc' },
  //   });
  // }

  // //AccountsPayable
  // async projectsOrderedByAccountsPayableDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { accountsPayable: 'desc' },
  //   });
  // }

  // async projectsOrderedByAccountsPayableAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { accountsPayable: 'asc' },
  //   });
  // }

  // //AccountsReceivable
  // async projectsOrderedByAccountsReceivableDesc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { accountsReceivable: 'desc' },
  //   });
  // }

  // async projectsOrderedByAccountsReceivableAsc(companyId: number) {
  //   return await this.prisma.project.findMany({
  //     where: { companyId },
  //     orderBy: { accountsReceivable: 'asc' },
  //   });
  // }

  // //TotalSales
  // async posOrderedBySalesDesc(companyId: number) {
  //   return await this.prisma.inventoryAndPos.findMany({
  //     where: { type: EntityType.POS, companyId },
  //     orderBy: { totalSales: 'desc' },
  //   });
  // }

  // async posOrderedBySalesAsc(companyId: number) {
  //   return await this.prisma.inventoryAndPos.findMany({
  //     where: { type: EntityType.POS, companyId },
  //     orderBy: { totalSales: 'asc' },
  //   });
  // }

  async salesGroupByDay(companyId: number) {
    const salesGroupByDay = await this.prisma.$queryRaw`
      SELECT
        all_dates.sale_date,
        COALESCE(SUM(s.price), 0) AS total_sales
      FROM
        (
          SELECT
            DATE_ADD(start_date, INTERVAL seq DAY) AS sale_date
          FROM
            (
              SELECT MIN(DATE(createdAt)) AS start_date, MAX(DATE(createdAt)) AS end_date
              FROM sales
              WHERE companyId = ${companyId}
            ) date_range,
            (
              SELECT @row := @row + 1 AS seq
              FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
                           SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
                   (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
                           SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
                   (SELECT @row := -1) r
            ) sequence
          WHERE
            seq <= DATEDIFF(end_date, start_date)
        ) all_dates
      LEFT JOIN sales s ON companyId = ${companyId} AND DATE(s.createdAt) = all_dates.sale_date
      GROUP BY
        all_dates.sale_date
      ORDER BY
        all_dates.sale_date ASC;
    `;
    return salesGroupByDay;
  }
}
