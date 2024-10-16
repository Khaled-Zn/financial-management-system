import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { AddItemToInventoryDto } from './dto/add-item-to-inventory.dto';
import { InventoryEntity } from './entities/inventory.entity';
import { RequestEntity } from 'src/pos/entities';
import { RequestInventoryItemDto } from './dto/request-item.dto';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('Inventories')
@ApiBearerAuth('access_token')
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_INVENTORIES)
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.inventoriesService.create(
      createInventoryDto,
      userPayload.company,
    );
  }

  @Get()
  @RequiredPermission(Permission.READ_INVENTORIES)
  findAll(@userMetaDate() userPayload: UserPayload) {
    return this.inventoriesService.findAll(userPayload.company);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_INVENTORIES)
  async findOne(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return InventoryEntity.createInstance(
      await this.inventoriesService.findOne(+id, userPayload.company),
    );
  }

  @Get('pos/:posId')
  @RequiredPermission(Permission.READ_INVENTORIES)
  async inventoriesOfPos(
    @Param('posId') posId: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return InventoryEntity.createInstance(
      await this.inventoriesService.inventoriesOfPos(
        +posId,
        userPayload.company,
      ),
    );
  }

  @Put(':id')
  @RequiredPermission(Permission.UPDATE_INVENTORIES)
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.inventoriesService.update(
      +id,
      updateInventoryDto,
      userPayload.company,
    );
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_INVENTORIES)
  remove(@Param('id') id: string, @userMetaDate() userPayload: UserPayload) {
    return this.inventoriesService.remove(+id, userPayload.company);
  }

  @Post(':id/items')
  @RequiredPermission(Permission.WRITE_INVENTORIES)
  addItems(
    @Param('id') id: string,
    @Body() addItemToInventoryDto: AddItemToInventoryDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.inventoriesService.addItem(
      +id,
      addItemToInventoryDto,
      userPayload.company,
    );
  }

  @Post(':id/items/request')
  @RequiredPermission(Permission.WRITE_INVENTORIES)
  async requestItem(
    @Body() requestItemDto: RequestInventoryItemDto,
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return await this.inventoriesService.requestItem(
      requestItemDto,
      +id,
      userPayload.company,
    );
  }

  @Get(':id/items/request')
  @RequiredPermission(Permission.WRITE_INVENTORIES)
  async findAllRequestItem(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return RequestEntity.createInstance(
      await this.inventoriesService.findAllRequestItem(
        +id,
        userPayload.company,
      ),
    );
  }
}
