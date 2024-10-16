import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/global/enums';

export const PERMISSION_KEY = 'permission';
export const RequiredPermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);
