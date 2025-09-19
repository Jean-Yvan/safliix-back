import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RequestUploadDto, 
  ConfirmUploadDto,
  RequestUploadCommand,
  ConfirmUploadCommand,
  AttachVideoToElmtCommand, 
  AttachVideoToElementDto
} from "@safliix-back/video";


@ApiTags("Videos")
@Controller("videos")
export class VideosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // -----------------------------
  // Request d'URL signée pour upload
  // -----------------------------
  @Post("request")
  @ApiOperation({ summary: "Demander une URL signée pour upload vidéo" })
  @ApiResponse({ status: 200, description: "URL signée générée" })
  async requestUpload(@Body() dto: RequestUploadDto) {
    const result = await this.commandBus.execute(new RequestUploadCommand(dto));

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  // -----------------------------
  // Confirmer que le fichier a été uploadé
  // -----------------------------
  @Post("confirm")
  @ApiOperation({ summary: "Confirmer que le fichier a été uploadé" })
  @ApiResponse({ status: 200, description: "Upload confirmé" })
  async confirmUpload(@Body() dto: ConfirmUploadDto) {
    const result = await this.commandBus.execute(new ConfirmUploadCommand(dto));

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  // -----------------------------
  // Attacher une vidéo à un élément (Movie, Episode, Ad)
  // -----------------------------
  @Post("attach")
  @ApiOperation({ summary: "Attacher une vidéo à un élément" })
  @ApiResponse({ status: 200, description: "Vidéo attachée" })
  async attachVideo(@Body() body: AttachVideoToElementDto) {
    
    const result = await this.commandBus.execute(
      new AttachVideoToElmtCommand(body)
    );

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  // -----------------------------
  // Query pour récupérer le status d'une vidéo
  // -----------------------------
  // @Get(":id/status")
  // @ApiOperation({ summary: "Récupérer le status d'un fichier vidéo" })
  // @ApiResponse({ status: 200, description: "Status retourné" })
  // async getVideoStatus(@Param("id") videoFileId: string) {
  //   const result = await this.queryBus.execute(new GetVideoStatusQuery(videoFileId));

  //   if (result.isErr()) {
  //     throw result.unwrapErr();
  //   }

  //   return {
  //     success: true,
  //     data: result.unwrap(),
  //   };
  // }
}
