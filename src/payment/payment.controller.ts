import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('payment')
@ApiBearerAuth('access_token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_PAYMENTS)
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.paymentService.create(createPaymentDto, userPayload.company);
  }

  @Get()
  @RequiredPermission(Permission.READ_PAYMENTS)
  findAll(@userMetaDate() userPayload: UserPayload) {
    return this.paymentService.findAll(userPayload.company);
  }
}
