import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../../../decorators/api-docs.decorator';
import { CurrentToken } from '../../../decorators/current-token.decorator';
import { AccountTokenAuthGuard } from '../../../middleware/account-token-auth.guard';
import { SuccessResponse } from '../../../utilities/success.response';
import { PaymentService } from '../services/payment.service';
import { buyStorageDocs } from './docs';

@ApiTags('payment')
@Controller('payment')
@UseGuards(AccountTokenAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiDocs(buyStorageDocs)
  @Get('buy-storage')
  async buyStorage(@CurrentToken('user_id') userId: number) {
    await this.paymentService.addStorage(userId, 104857600); // 100MB in bytes
    return SuccessResponse('Added 100mb+ to storage');
  }
}
