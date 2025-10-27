import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Pay for the cart
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {409} Conflict
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post('/pay')
  payCart(@User('id') userId: string): Promise<boolean> {
    return this.paymentsService.payCart(userId);
  }
}
