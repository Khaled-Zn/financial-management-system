import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { ItemsCenterService } from './items-center.service';
import { CreateItemsCenterDto } from './dto/create-items-center.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ItemEntity } from './entities/items-center.entity';
import { UpdateItemsCenterDto } from './dto/update-items-center.dto';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { FilterDto, SearchDto } from './dto/search.dto';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('Items-center')
@ApiBearerAuth('access_token')
@Controller('items-center')
export class ItemsCenterController {
  constructor(private readonly itemsCenterService: ItemsCenterService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_ITEMS)
  async create(
    @Body() createItemsCenterDto: CreateItemsCenterDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const item = await this.itemsCenterService.create(
      createItemsCenterDto,
      userPayload.company,
    );
    return ItemEntity.createInstance(item);
  }

  @Get()
  @RequiredPermission(Permission.READ_ITEMS)
  async findAll(
    @Query() filterhDto: FilterDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const items = await this.itemsCenterService.findAll(
      filterhDto,
      userPayload.company,
    );
    return ItemEntity.createInstance(items);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_ITEMS)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const item = await this.itemsCenterService.findOne(id, userPayload.company);
    return ItemEntity.createInstance(item);
  }

  @Get('search')
  @RequiredPermission(Permission.READ_ITEMS)
  search(
    @Query() searchDto: SearchDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.itemsCenterService.search(searchDto, userPayload.company);
  }

  @Put(':id')
  @RequiredPermission(Permission.UPDATE_ITEMS)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemsCenterDto: UpdateItemsCenterDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const item = await this.itemsCenterService.update(
      id,
      updateItemsCenterDto,
      userPayload.company,
    );
    return ItemEntity.createInstance(item);
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_ITEMS)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.itemsCenterService.remove(id, userPayload.company);
  }
}
