import { Injectable, Logger } from '@nestjs/common';

export interface S3ServiceConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  cdnBaseUrl?: string;
  defaultExpirySeconds?: number;
}

@Injectable()
export class S3Service {
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnBaseUrl?: string;
  private readonly defaultExpirySeconds: number;
  private readonly logger = new Logger(S3Service.name);
  private clientPromise:
    | Promise<{
        client: any;
        PutObjectCommand: any;
        getSignedUrl: (client: any, command: any, options?: any) => Promise<string>;
      }>
    | null = null;

  constructor() {
    const {
      AWS_REGION,
      S3_REGION,
      S3_ENDPOINT,
      S3_FORCE_PATH_STYLE,
      S3_BUCKET,
      UPLOADS_BUCKET,
      CDN_BASE_URL,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
    } = process.env;

    this.region = AWS_REGION ?? S3_REGION ?? 'us-east-1';
    this.bucket = S3_BUCKET ?? UPLOADS_BUCKET ?? 'uploads';
    this.cdnBaseUrl = CDN_BASE_URL;
    this.defaultExpirySeconds = 15 * 60;

    // lazy client init to avoid crashing if aws sdk is not installed in local env
    if (S3_ENDPOINT || AWS_ACCESS_KEY_ID || AWS_SECRET_ACCESS_KEY) {
      this.clientPromise = this.loadClient({
        region: this.region,
        endpoint: S3_ENDPOINT,
        forcePathStyle: S3_FORCE_PATH_STYLE === 'true',
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      });
    }
  }

  private async loadClient(config: {
    region: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    try {
      const clientModuleId = process.env.S3_CLIENT_MODULE ?? '@aws-sdk/client-s3';
      const presignModuleId =
        process.env.S3_PRESIGNER_MODULE ?? '@aws-sdk/s3-request-presigner';
      const [{ S3Client, PutObjectCommand }, { getSignedUrl }] = await Promise.all([
        import(clientModuleId),
        import(presignModuleId),
      ]);

      const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle,
        credentials:
          config.accessKeyId && config.secretAccessKey
            ? {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
              }
            : undefined,
      });

      return { client, PutObjectCommand, getSignedUrl };
    } catch (error) {
      this.logger.error(
        'AWS SDK for S3 not installed. Please install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner',
        error as Error,
      );
      throw error;
    }
  }

  async presignUpload(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; finalUrl: string }> {
    const { key, contentType, expiresInSeconds } = params;

    this.clientPromise =
      this.clientPromise ??
      this.loadClient({
        region: this.region,
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

    let deps;
    try {
      deps = await this.clientPromise;
    } catch (error) {
      throw new Error(
        'AWS SDK for S3 is missing. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner to enable uploads.',
      );
    }
    const command = new deps.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await deps.getSignedUrl(deps.client, command, {
      expiresIn: expiresInSeconds ?? this.defaultExpirySeconds,
    });

    const finalUrl = this.cdnBaseUrl
      ? `${this.cdnBaseUrl}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, finalUrl };
  }

  buildObjectKey(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .map((p) => p.replace(/\s+/g, '-'))
      .join('/');
  }

  logConfig() {
    this.logger.debug(`S3 bucket=${this.bucket} region=${this.region}`);
  }
}
