import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  Delete,
} from '@nestjs/common';
import { UniqueEmailPipe } from './pipes/email-unique.validator.pipe';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/createContact.dto';
import { UpdateContactDto } from './dto/updateContact.dto';
import { ContactEntity } from './entities/contact.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { UpdateUniqueEmailPipe } from './pipes/update-email-unique.validator.pipe';
import { UserPayload } from 'src/global/@types';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';

@ApiTags('Contact')
@ApiBearerAuth('access_token')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('')
  @UsePipes(UniqueEmailPipe)
  @RequiredPermission(Permission.WRITE_CLIENTS)
  async create(
    @Body() contactDto: ContactDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const Contact = await this.contactService.create(
      contactDto,
      userPayload.company,
    );
    return ContactEntity.createInstance(Contact);
  }

  @Get()
  @RequiredPermission(Permission.READ_CLIENTS)
  async findAll(@userMetaDate() userPayload: UserPayload) {
    const Contact = await this.contactService.findAll(userPayload.company);
    return ContactEntity.createInstance(Contact);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_CLIENTS)
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const Contact = await this.contactService.findOne(+id, userPayload.company);
    if (!Contact) {
      throw new HttpException('Not Found', 404);
    }
    return ContactEntity.createInstance(Contact);
  }

  @Put(':id')
  @UsePipes(UpdateUniqueEmailPipe)
  @RequiredPermission(Permission.UPDATE_CLIENTS)
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const Admin = await this.contactService.findOne(+id, userPayload.company);
    if (!Admin) {
      throw new HttpException('Not Found', 404);
    }
    const Contact = await this.contactService.update(
      +id,
      updateContactDto,
      userPayload.company,
    );
    return ContactEntity.createInstance(Contact);
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_CLIENTS)
  async remove(
    @Param('id', ParseIntPipe) id: string,
    @userMetaDate() userPayload: UserPayload,
  ): Promise<void> {
    const Contact = await this.contactService.findOne(+id, userPayload.company);
    if (!Contact) {
      throw new HttpException('Not Found', 404);
    }
    return this.contactService.remove(+ImageData, userPayload.company);
  }
}
