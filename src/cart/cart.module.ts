import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartOrdersEntity } from './entities/cart-orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartOrdersEntity])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
