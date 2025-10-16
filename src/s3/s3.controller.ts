import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseUploadObjectDto } from './dto/response-upload-object.dto';
import { UploadObjectDto } from './dto/upload-object.dto';
import { S3Service } from './s3.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  /**
   * Generate url for uploading file
   *
   * @throws {400} Bad request
   * @throws {401} Unauthorized
   * @throws {403} Forbidden
   */
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Post('/generate-upload-url')
  generateUploadUrl(
    @Body() dto: UploadObjectDto,
  ): Promise<ResponseUploadObjectDto> {
    return this.s3Service.generateUploadUrl(dto);
  }
}
