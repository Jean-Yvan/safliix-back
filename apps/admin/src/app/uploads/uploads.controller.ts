import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { randomUUID } from 'crypto';
import { S3Service } from '@safliix-back/s3';

class GenericUploadFileDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  type!: string;
}

class GenericUploadRequestDto {
  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenericUploadFileDto)
  files!: GenericUploadFileDto[];
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly s3: S3Service) {}

  @Post('presign')
  @ApiOperation({ summary: 'Pré-signe des uploads génériques' })
  async presign(@Body() dto: GenericUploadRequestDto) {
    if (!dto.files?.length) {
      throw new BadRequestException('files is required');
    }

    const uploads = await Promise.all(
      dto.files.map(async (file) => {
        const key = this.s3.buildObjectKey(
          dto.resourceType ?? 'generic',
          dto.resourceId ?? 'temp',
          file.key,
          `${randomUUID()}-${file.name}`,
        );
        const { uploadUrl, finalUrl } = await this.s3.presignUpload({
          key,
          contentType: file.type,
        });
        return { key: file.key, uploadUrl, finalUrl };
      }),
    );

    return { success: true, data: uploads };
  }

  @Post('finalize')
  @ApiOperation({ summary: 'Finalise des uploads génériques' })
  async finalize(
    @Body()
    body: {
      resourceId?: string;
      uploads: { key: string; finalUrl: string }[];
    },
  ) {
    if (!body?.uploads?.length) {
      throw new BadRequestException('uploads is required');
    }
    return { success: true, data: { ok: true, resourceId: body.resourceId ?? null } };
  }
}
