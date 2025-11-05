import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { DeletedIdsResponseDto } from '../common/dto/deleted-ids-response.dto';
import { IdsDto } from '../common/dto/ids.dto';
import { CourseResponseDto } from '../cources/dto/course-response.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get cart of courses
   *
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Get()
  getCart(@User('id') userId: string): Promise<CourseResponseDto[]> {
    return this.cartService.getCart(userId);
  }

  /**
   * Add courses to cart
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Post()
  addOrders(@User('id') userId: string, @Body() dto: IdsDto): Promise<IdsDto> {
    return this.cartService.addOrders(userId, dto.ids);
  }

  /**
   * Delete courses from cart
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @Delete()
  deleteOrders(
    @User('id') userId: string,
    @Body() dto: IdsDto,
  ): Promise<DeletedIdsResponseDto> {
    return this.cartService.deleteOrders(userId, dto.ids);
  }
}
