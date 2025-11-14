import {
  AdWithRelation,
  CreateToPrisma,
  MediaAttachmentWithRelation,
  UpdateToPrisma,
} from '@safliix-back/database';
import { Ad, AdPrimitives } from '../entities/ad.entity';
import { AdAttachmentPrimitives } from '../types/ad-attachment.type';

export class AdMapper {
  static toDomain(data: AdWithRelation): Ad {
    return Ad.restore(this.fromPrisma(data));
  }

  static toCreatePrisma(ad: Ad): CreateToPrisma<'Ad'> {
    const primitive = ad.toPrimitives();
    return {
      title: primitive.title,
      imageUrl: primitive.imageUrl,
      startDate: primitive.startDate,
      endDate: primitive.endDate,
      isActive: primitive.isActive,
    };
  }

  static toUpdatePrisma(ad: Ad): UpdateToPrisma<'Ad'> {
    const primitive = ad.toPrimitives();
    if (!primitive.id) {
      throw new Error('Cannot update an Ad without id');
    }
    return {
      where: { id: primitive.id },
      data: {
        title: primitive.title,
        imageUrl: primitive.imageUrl,
        startDate: primitive.startDate,
        endDate: primitive.endDate,
        isActive: primitive.isActive,
      },
    };
  }

  private static fromPrisma(data: AdWithRelation): AdPrimitives {
    return {
      id: data.id,
      title: data.title,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      attachments: this.mapAttachments(data.attachment),
    };
  }

  private static mapAttachments(
    attachments?: MediaAttachmentWithRelation[],
  ): AdAttachmentPrimitives[] {
    if (!attachments?.length) {
      return [];
    }
    return attachments.map((attachment) => ({
      id: attachment.id,
      mediaFileId: attachment.mediaFileId,
      type: attachment.type,
      mediaFile: attachment.mediaFile
        ? {
            id: attachment.mediaFile.id,
            s3Key: attachment.mediaFile.s3Key,
            duration: attachment.mediaFile.duration,
            width: attachment.mediaFile.width,
            height: attachment.mediaFile.height,
            status: attachment.mediaFile.status,
            mediaType: attachment.mediaFile.mediaType,
          }
        : undefined,
    }));
  }
}
