import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Step 1: Create a payment order.
   * Returns a Razorpay order (or mock order) to be opened in the frontend checkout.
   */
  @Post('create-order')
  @Roles('PATIENT')
  createOrder(
    @Request() req: any,
    @Body() data: { slotId: string; date: string; notes?: string },
  ) {
    return this.paymentsService.createOrder(req.user.userId, data);
  }

  /**
   * Step 2: Verify payment and book the appointment.
   * In mock mode: no signature check; auto-accepts any payment ID.
   * In live mode: validates Razorpay HMAC signature.
   */
  @Post('verify')
  @Roles('PATIENT')
  verifyAndBook(
    @Request() req: any,
    @Body()
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      slotId: string;
      date: string;
      notes?: string;
    },
  ) {
    return this.paymentsService.verifyAndBook(req.user.userId, data);
  }
}
