import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAuthDto } from './dto/dashboard-auth.dto';
import { SubscribeCompanyDto } from './dto/subscribe-company.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/global/decorators/public.decorator';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { DashboardAuthGuard } from './guards/dashboard-auth.guard';
import { UpdateSubscribeCompanyDto } from './dto/update-subscribe-company.dto';
import { UserPayload } from 'src/global/@types';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('login')
  @Public()
  login(@Body() dashboardAuthDto: DashboardAuthDto) {
    return this.dashboardService.signIn(dashboardAuthDto);
  }

  @ApiBearerAuth('access_token')
  @Public()
  @UseGuards(DashboardAuthGuard)
  @Get('getme')
  async getme(@userMetaDate() idOfUser: UserPayload) {
    const me = await this.dashboardService.getme(idOfUser.id);
    return me;
  }

  @ApiBearerAuth('access_token')
  @Public()
  @UseGuards(DashboardAuthGuard)
  @Post('company/subscribe')
  subscribeCompany(@Body() subscribeCompanyDto: SubscribeCompanyDto) {
    return this.dashboardService.subscribeCompany(subscribeCompanyDto);
  }

  @ApiBearerAuth('access_token')
  @Public()
  @UseGuards(DashboardAuthGuard)
  @Get('companies')
  findAll() {
    return this.dashboardService.findAll();
  }

  @ApiBearerAuth('access_token')
  @Public()
  @UseGuards(DashboardAuthGuard)
  @Get('companies/:id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @ApiBearerAuth('access_token')
  @Public()
  @UseGuards(DashboardAuthGuard)
  @Put('companies/:id/resubscribe')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateSubscribeCompanyDto,
  ) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }
}
