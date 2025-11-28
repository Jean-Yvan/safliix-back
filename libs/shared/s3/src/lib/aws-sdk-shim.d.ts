declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config?: any);
  }
  export class PutObjectCommand {
    constructor(input?: any);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options?: any): Promise<string>;
}
