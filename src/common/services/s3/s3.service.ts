import path from 'path';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  ConsoleLogger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UploadObject } from './types';

@Injectable()
export class S3Service {
  private static CLOUDFLARE_R2_PUBLIC_BUCKET: string;
  private static CLOUDFLARE_R2_PRIVATE_BUCKET: string;
  private static CLOUDFLARE_R2_PUBLIC_DOMAIN: string;
  private readonly s3Client: S3Client;
  private logger = new ConsoleLogger(S3Service.name);

  constructor(configService: ConfigService) {
    S3Service.CLOUDFLARE_R2_PUBLIC_BUCKET = configService.getOrThrow<string>(
      'CLOUDFLARE_R2_PUBLIC_BUCKET',
    );
    S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET = configService.getOrThrow<string>(
      'CLOUDFLARE_R2_PRIVATE_BUCKET',
    );
    S3Service.CLOUDFLARE_R2_PUBLIC_DOMAIN = configService.getOrThrow<string>(
      'CLOUDFLARE_R2_PUBLIC_DOMAIN',
    );
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: configService.getOrThrow<string>('CLOUDFLARE_R2_ENDPOINT'),
      credentials: {
        accessKeyId: configService.getOrThrow<string>(
          'CLOUDFLARE_R2_ACCESS_KEY_ID',
        ),
        secretAccessKey: configService.getOrThrow<string>(
          'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  private getFileExtension(filename: string, contentType: string) {
    return (
      path.extname(filename).replace('.', '') ||
      contentType.split('/').slice(-1)[0] ||
      ''
    );
  }

  private preparePutCommandOptions({
    filename,
    contentType,
    directories,
    isPublic,
  }: Omit<UploadObject, 'ttl'>) {
    const fileExtension = this.getFileExtension(filename, contentType);
    const directoryPath = directories?.length
      ? `${directories.join('/')}/`
      : '';
    const prefixId = uuidv4();
    const fileKey = `${directoryPath}${prefixId}-${Date.now()}${fileExtension ? `.${fileExtension}` : ''}`;
    const bucketName = isPublic
      ? S3Service.CLOUDFLARE_R2_PUBLIC_BUCKET
      : S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET;

    return { fileKey, bucketName, prefixId };
  }

  async uploadObject({
    filename,
    isPublic,
    contentType,
    directories,
    buffer,
  }: UploadObject) {
    try {
      const { prefixId, fileKey, bucketName } = this.preparePutCommandOptions({
        filename,
        contentType,
        directories,
        isPublic,
      });
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: contentType,
        Body: buffer,
      });
      await this.s3Client.send(command);

      return { prefixId, fileKey };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `Failed to upload object: ${filename}`,
      );
    }
  }

  async generateUploadUrl({
    filename,
    isPublic,
    contentType,
    ttl,
    directories,
  }: UploadObject) {
    try {
      const { prefixId, fileKey, bucketName } = this.preparePutCommandOptions({
        filename,
        contentType,
        directories,
        isPublic,
      });
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: ttl,
      });

      return {
        uploadUrl,
        prefixId,
        fileKey,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `Failed to generate upload url for object: ${filename}`,
      );
    }
  }

  private async moveObjectBetweenBuckets(
    fileKey: string,
    sourceBucket: string,
    targetBucket: string,
  ) {
    try {
      const copyCommand = new CopyObjectCommand({
        CopySource: `${sourceBucket}/${fileKey}`,
        Bucket: targetBucket,
        Key: fileKey,
      });
      await this.s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: fileKey,
      });
      await this.s3Client.send(deleteCommand);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `Failed to move object: ${fileKey}`,
      );
    }
  }

  makeObjectPublic(fileKey: string) {
    return this.moveObjectBetweenBuckets(
      fileKey,
      S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET,
      S3Service.CLOUDFLARE_R2_PUBLIC_BUCKET,
    );
  }

  makeObjectPrivate(fileKey: string) {
    return this.moveObjectBetweenBuckets(
      fileKey,
      S3Service.CLOUDFLARE_R2_PUBLIC_BUCKET,
      S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET,
    );
  }

  async deleteObject(fileKey: string, isPublic: boolean) {
    try {
      const sourceBucket = isPublic
        ? S3Service.CLOUDFLARE_R2_PUBLIC_BUCKET
        : S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET;
      const deleteCommand = new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: fileKey,
      });
      await this.s3Client.send(deleteCommand);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `Failed to delete object: ${fileKey}`,
      );
    }
  }

  async generateViewUrl(fileKey: string, ttl: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3Service.CLOUDFLARE_R2_PRIVATE_BUCKET,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: ttl });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `Failed to generate view url for object: ${fileKey}`,
      );
    }
  }

  getPublicUrl(fileKey: string): string {
    return `${S3Service.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${fileKey}`;
  }
}
