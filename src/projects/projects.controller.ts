import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { CreatepProjectDto, UpdateProjectDto } from './dto';
import { ProjectsService } from './projects.service';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@ApiTags('projects')
@ApiBearerAuth('access_token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequiredPermission(Permission.WRITE_PROJECTS)
  create(
    @Body() createInventoryDto: CreatepProjectDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.projectsService.create(createInventoryDto, userPayload.company);
  }

  @Get()
  @RequiredPermission(Permission.READ_PROJECTS)
  findAll(@userMetaDate() userPayload: UserPayload) {
    return this.projectsService.findAll(userPayload.company);
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_PROJECTS)
  async findOne(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return await this.projectsService.findOne(+id, userPayload.company);
  }

  @Put(':id')
  @RequiredPermission(Permission.UPDATE_PROJECTS)
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateProjectDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return this.projectsService.update(
      +id,
      updateInventoryDto,
      userPayload.company,
    );
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_PROJECTS)
  remove(@Param('id') id: string, @userMetaDate() userPayload: UserPayload) {
    return this.projectsService.remove(+id, userPayload.company);
  }
}
