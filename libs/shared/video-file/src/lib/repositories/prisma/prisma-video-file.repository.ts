import { Injectable } from '@nestjs/common';
import { PrismaService } from '@safliix-back/database';
import { VideoFileRepository } from '../../ports/video-file.repository';
import { VideoFile } from '../../entities/video-file.entity';
import { VideoFileStatus } from '../../enums/video-file-status.enum';
import { VideoFileMapper } from '../../mappers/video-file.mapper';

@Injectable()
export class PrismaVideoFileRepository implements VideoFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<VideoFile | null> {
    try {
      const videoFile = await this.prisma.videoFile.findUnique({
        where: { id }
      });

      if (!videoFile) {
        return null;
      }

      return VideoFileMapper.toDomain(videoFile);
    } catch (error) {
      throw new Error(`Failed to find video file by id: ${error}`);
    }
  }

  async save(videoFile: VideoFile): Promise<void> {
    try {
      if (!videoFile.id) {
        // Create new video file
        const data = VideoFileMapper.toPrismaCreate(videoFile);
        await this.prisma.videoFile.create({ data });
      } else {
        // Update existing video file
        const data = VideoFileMapper.toPrismaUpdate(videoFile.id, videoFile);
        await this.prisma.videoFile.update(data);
      }
    } catch (error) {
      throw new Error(`Failed to save video file: ${error}`);
    }
  }

  async update(videoFile: VideoFile): Promise<void> {
    try {
      if (!videoFile.id) {
        throw new Error('Cannot update video file without id');
      }

      const data = VideoFileMapper.toPrismaUpdate(videoFile.id, videoFile);
      await this.prisma.videoFile.update(data);
    } catch (error) {
      throw new Error(`Failed to update video file: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.videoFile.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to delete video file: ${error}`);
    }
  }

  async updateStatus(id: string, status: VideoFileStatus): Promise<void> {
    try {
      await this.prisma.videoFile.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      throw new Error(`Failed to update video file status: ${error}`);
    }
  }

  async markAsProcessing(id: string): Promise<void> {
    await this.updateStatus(id, VideoFileStatus.PROCESSING);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async markAsFailed(id: string, _error?: string): Promise<void> {
    try {
      await this.prisma.videoFile.update({
        where: { id },
        data: {
          status: VideoFileStatus.FAILED,
          // Note: Prisma schema doesn't have error field, so we skip storing the error
        }
      });
    } catch (err) {
      throw new Error(`Failed to mark video file as failed: ${err}`);
    }
  }

  async findByS3Key(s3Key: string): Promise<VideoFile | null> {
    try {
      const videoFile = await this.prisma.videoFile.findFirst({
        where: { filePath: s3Key }
      });

      if (!videoFile) {
        return null;
      }

      return VideoFileMapper.toDomain(videoFile);
    } catch (error) {
      throw new Error(`Failed to find video file by S3 key: ${error}`);
    }
  }

  async findByStatus(status: VideoFileStatus): Promise<VideoFile[]> {
    try {
      const videoFiles = await this.prisma.videoFile.findMany({
        where: { status }
      });

      return videoFiles.map(VideoFileMapper.toDomain);
    } catch (error) {
      throw new Error(`Failed to find video files by status: ${error}`);
    }
  }
}