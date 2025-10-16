import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartOrdersEntity } from './entities/cart-orders.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartOrdersEntity]), UsersModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
