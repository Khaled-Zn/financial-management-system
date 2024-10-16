import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { UserPayload } from 'src/global/@types';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';

@ApiTags('sales')
@ApiBearerAuth('access_token')
@Controller('sales')
export class SalesController {
  constructor(private saleService: SalesService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_SALES)
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const sale = await this.saleService.create(
      createSaleDto,
      userPayload.company,
    );

    return sale;
  }

  @Get()
  @RequiredPermission(Permission.READ_SALES)
  async findAll(@userMetaDate() userPayload: UserPayload) {
    const sales = await this.saleService.findAll(userPayload.company);
    return sales;
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_SALES)
  async findOne(
    @Param('id') id: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const sale = await this.saleService.findOne(+id, userPayload.company);
    if (!sale) throw new NotFoundException('Not Found');
    return sale;
  }
}
