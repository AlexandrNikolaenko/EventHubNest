import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async uploadUserAvatar(file: Express.Multer.File, userId: number) {
    const key = `avatars/${userId}-${Date.now()}${this.getExtension(file)}`;

    if (!this.hasS3Config()) {
      return this.saveLocal(file, key);
    }

    const bucket = this.configService.getOrThrow<string>('S3_BUCKET');
    const endpoint =
      this.configService.get<string>('S3_ENDPOINT') ??
      'https://storage.yandexcloud.net';

    const client = new S3Client({
      endpoint,
      region: this.configService.get<string>('S3_REGION') ?? 'ru-central1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'S3_SECRET_ACCESS_KEY',
        ),
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl =
      this.configService.get<string>('S3_PUBLIC_URL') ??
      `${endpoint.replace(/\/$/, '')}/${bucket}`;

    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  private hasS3Config() {
    return Boolean(
      this.configService.get<string>('S3_BUCKET') &&
      this.configService.get<string>('S3_ACCESS_KEY_ID') &&
      this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
    );
  }

  private getExtension(file: Express.Multer.File) {
    const fromName = extname(file.originalname).toLowerCase();

    if (fromName) {
      return fromName;
    }

    if (file.mimetype === 'image/png') {
      return '.png';
    }

    if (file.mimetype === 'image/webp') {
      return '.webp';
    }

    if (file.mimetype === 'image/jpeg') {
      return '.jpg';
    }

    throw new BadRequestException('Unsupported avatar file type');
  }

  private async saveLocal(file: Express.Multer.File, key: string) {
    const relativePath = key.replaceAll('\\', '/');
    const targetPath = join(process.cwd(), 'public', relativePath);

    await mkdir(join(process.cwd(), 'public', 'avatars'), { recursive: true });
    await writeFile(targetPath, file.buffer);

    return `/${relativePath}`;
  }
}
