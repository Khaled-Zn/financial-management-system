import { Controller, Get, Post, Res, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceEntity } from './entities/invoice.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { FilterDto } from './dto/filter.dto';
import { Response } from 'express';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('Invoices')
@ApiBearerAuth('access_token')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_INVOICES)
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const invoice = await this.invoicesService.create(
      createInvoiceDto,
      userPayload.company,
    );
    return InvoiceEntity.createInstance(invoice);
  }

  @Get()
  @RequiredPermission(Permission.READ_INVOICES)
  async findAll(
    @Query() filterhDto: FilterDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const invoices = await this.invoicesService.findAll(
      filterhDto,
      userPayload.company,
    );
    return InvoiceEntity.createInstance(invoices);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_INVOICES)
  async findOne(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const invoice = await this.invoicesService.findOne(
      +id,
      userPayload.company,
    );
    return InvoiceEntity.createInstance(invoice);
  }

  @Get(':id/pdf')
  @RequiredPermission(Permission.READ_INVOICES)
  async convertInvoiceToPdf(
    @Param('id') id: string,
    @Res() res: Response,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const pdf = await this.invoicesService.convertInvoiceToPdf(
      +id,
      userPayload.company,
    );

    res.set({
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
    });

    res.send(pdf);
  }
}
