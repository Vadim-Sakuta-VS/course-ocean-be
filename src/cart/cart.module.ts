import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartOrdersEntity } from './entities/cart-orders.entity';
import { CoursesModule } from '../cources/cources.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartOrdersEntity]),
    UsersModule,
    CoursesModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
