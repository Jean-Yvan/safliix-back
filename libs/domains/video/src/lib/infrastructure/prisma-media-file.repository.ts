import { Injectable } from '@nestjs/common';
import { PrismaService,MediaFileStatus } from '@safliix-back/database';
import { MediaFileRepository } from '../domain/ports/media-file.repository';
import { MediaFile } from '../domain/entities/media-file.entity';
import { MediaFileMapper } from '../domain/mappers/media-file.mapper';
import { ElementType, AttachmentType } from '../utils/types';


@Injectable()
export class PrismaMediaFileRepository implements MediaFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaFile | null> {
    
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!mediaFile) {
      return null;
    }

    return MediaFileMapper.toDomain(mediaFile);
  }

  async save(mediaFile: MediaFile): Promise<void> {
    
    if (!mediaFile.id) {
      // Create new media file
      const data = MediaFileMapper.toPrismaCreate(mediaFile);
      await this.prisma.mediaFile.create({ data });
    } else {
      // Update existing media file
      const data = MediaFileMapper.toPrismaUpdate(mediaFile.id, mediaFile);
      await this.prisma.mediaFile.update(data);
    }  
    
  }

  async update(mediaFile: MediaFile): Promise<void> {
    
      if (!mediaFile.id) {
        throw new Error('Cannot update media file without id');
      }

      const data = MediaFileMapper.toPrismaUpdate(mediaFile.id, mediaFile);
      await this.prisma.mediaFile.update(data);
     
  }

  async delete(id: string): Promise<void> {
    
      await this.prisma.mediaFile.delete({
        where: { id }
      });
    
  }

  async updateStatus(id: string, status: MediaFileStatus): Promise<void> {
    
      await this.prisma.mediaFile.update({
        where: { id },
        data: { status }
      });
    
  }

  async markAsProcessing(id: string): Promise<void> {
    await this.updateStatus(id, MediaFileStatus.PROCESSING);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async markAsFailed(id: string, _error?: string): Promise<void> {
    
      await this.prisma.mediaFile.update({
        where: { id },
        data: {
          status: MediaFileStatus.FAILED,
          // Note: Prisma schema doesn't have error field, so we skip storing the error
        }
      });
    
  }

  async findByS3Key(s3Key: string): Promise<MediaFile | null> {
    
      const mediaFile = await this.prisma.mediaFile.findFirst({
        where: { s3Key }
      });

      if (!mediaFile) {
        return null;
      }

      return MediaFileMapper.toDomain(mediaFile);
    
  }

  async findByStatus(status: MediaFileStatus): Promise<MediaFile[]> {
    
      const mediaFiles = await this.prisma.mediaFile.findMany({
        where: { status }
      });

      return mediaFiles.map(MediaFileMapper.toDomain);
    
  }

  async attachToElement(
    mediaFileId: string,
    elementType: ElementType,
    elementId: string,
    type: AttachmentType
  ): Promise<void> {
    const data: any = { mediaFileId, type };

    // Déterminer la colonne selon le type d’élément
    switch (elementType) {
      case "MOVIE":
        data.movieId = elementId;
        break;
      case "EPISODE":
        data.episodeId = elementId;
        break;
      case "AD":
        data.adId = elementId;
        break;
      default:
        throw new Error(`ElementType inconnu: ${elementType}`);
    }

    await this.prisma.mediaAttachment.create({ data });
  }
  async generateSignedUrl(mediaFileId: string): Promise<string> {
    // Méthode fictive pour générer une URL signée
    // En pratique, cela impliquerait d'interagir avec un service de stockage comme AWS S3
    return `https://signed-url-for-media-file/${mediaFileId}`;

    //  const bucket = process.env.AWS_BUCKET_NAME!;
    // const key = `medias/${mediaFileId}.mp4`; // tu peux adapter le chemin selon ton organisation

    // const command = new PutObjectCommand({
    //   Bucket: bucket,
    //   Key: key,
    //   ContentType: "media/mp4", // ou dynamique selon l'extension
    // });

    // // Génère un URL signé qui expire après X secondes
    // const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    // const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }); // 5 minutes

    // return url;
  }
}