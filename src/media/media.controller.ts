import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth('access_token')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadDto,
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.upload(file);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.findOne(+id);
    const file = createReadStream(join(process.cwd(), media.url));
    res.setHeader('Content-Type', media.type);
    file.pipe(res);
  }
}
