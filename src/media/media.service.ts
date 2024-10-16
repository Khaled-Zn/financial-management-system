import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as FileType from 'file-type';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}
  private async getFileType(): Promise<typeof FileType> {
    return await (eval(`import ('file-type')`) as Promise<typeof FileType>);
  }
  async upload(file: Express.Multer.File) {
    Logger.debug(file.destination);
    const { fileTypeFromFile } = await this.getFileType();
    const fileType = await fileTypeFromFile(file.path);
    if (!fileType) {
      new UnprocessableEntityException(['File type is not valid']);
    }
    const { id } = await this.prisma.media.create({
      data: {
        name: file.filename,
        extension: fileType.ext,
        type: fileType.mime,
        url: file.path,
      },
    });
    return { id };
  }
  async findOne(id: number) {
    const media = await this.prisma.media.findFirstOrThrow({
      where: {
        id,
      },
    });
    return media;
  }
}
