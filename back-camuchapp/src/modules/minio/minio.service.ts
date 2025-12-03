import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { extname } from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'productos');

    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log(`MinIO Client initialized: ${endPoint}:${port} (SSL: ${useSSL})`);

    // Ensure bucket exists
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
        
        // Set bucket policy to public read
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Bucket policy set to public read.`);
      }
    } catch (err) {
      this.logger.error(`Error checking/creating bucket: ${err.message}`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const filename = `${randomName}${extname(file.originalname)}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      filename,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    const publicEndpoint = this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') || `${protocol}://${endpoint}:${port}`;
    
    return `${publicEndpoint}/${this.bucketName}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
     try {
         const urlParts = fileUrl.split('/');
         const filename = urlParts[urlParts.length - 1];
         await this.minioClient.removeObject(this.bucketName, filename);
     } catch (error) {
         this.logger.error(`Error deleting file ${fileUrl}: ${error.message}`);
     }
  }
}
