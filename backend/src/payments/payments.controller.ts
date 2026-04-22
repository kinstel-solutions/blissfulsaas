import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @Roles('PATIENT')
  createOrder(
    @Request() req: any,
    @Body() data: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(req.user.userId, data);
  }

  @Post('verify')
  @Roles('PATIENT')
  verifyAndBook(
    @Request() req: any,
    @Body() data: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyAndBook(req.user.userId, data);
  }
}
