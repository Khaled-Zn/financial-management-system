import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import {
  AddItemToPosDto,
  CreatePosDto,
  RequestItemDto,
  UpdatePosDto,
} from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PosEntity, RequestEntity } from './entities';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('pos')
@ApiBearerAuth('access_token')
@Controller('pos')
export class PosController {
  constructor(private posService: PosService) {}
  @Post()
  @RequiredPermission(Permission.WRITE_POS)
  async create(
    @Body() createPosDto: CreatePosDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return PosEntity.createInstance(
      await this.posService.create(createPosDto, userPayload.company),
    );
  }

  @Get()
  @RequiredPermission(Permission.READ_POS)
  async findAll(@userMetaDate() userPayload: UserPayload) {
    return await this.posService.findAll(userPayload.company);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_POS)
  async findOne(
    @Param('id') id: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const pos = await this.posService.findOne(id, userPayload.company);
    if (!pos) return {};
    return PosEntity.createInstance(pos);
  }

  @Put(':id')
  @RequiredPermission(Permission.UPDATE_POS)
  async update(
    @Param('id') id: number,
    @Body() updatePosDto: UpdatePosDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return PosEntity.createInstance(
      await this.posService.upate(id, updatePosDto, userPayload.company),
    );
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_POS)
  async delete(
    @Param('id') id: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return await this.posService.delete(id, userPayload.company);
  }

  @Post(':id/items')
  @RequiredPermission(Permission.WRITE_POS)
  async addItem(
    @Body() addItemToPosDto: AddItemToPosDto,
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return await this.posService.addItemFormInventory(
      addItemToPosDto,
      +id,
      userPayload.company,
    );
  }

  @Post(':id/items/request')
  @RequiredPermission(Permission.WRITE_POS)
  async requestItem(
    @Body() requestItemDto: RequestItemDto,
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return await this.posService.requestItem(
      requestItemDto,
      +id,
      userPayload.company,
    );
  }

  @Get(':id/items/request')
  @RequiredPermission(Permission.READ_POS)
  async findAllRequestItem(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return RequestEntity.createInstance(
      await this.posService.findAllRequestItem(+id, userPayload.company),
    );
  }
}
