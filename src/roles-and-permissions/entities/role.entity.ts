import { Exclude, Type, instanceToPlain } from 'class-transformer';
import { PermissionEntity } from './permission.entity';
import { Action, Feature } from '../enums';

class Permission {
  id: number;
  title: string;
  // constructor(id: number, title: string) {
  //   this.id = id;
  //   this.title = title;
  // }
}
class GroupedPermissions {
  [key: string]: Permission[];
}

class Role {
  id: number;
  title: string;
  permissions: Permission[];
}

export class RoleEntity {
  id: number;
  title: string;
  @Type(() => GroupedPermissions)
  groupedPermissions: GroupedPermissions;
  @Exclude()
  permissions: Permission[];
  // @Exclude()
  permissionsEnum: string[];

  constructor(
    partial: Partial<Role>,
    permissionsIds: { [key: string]: number },
  ) {
    this.groupedPermissions = new GroupedPermissions();
    let isSelected: boolean;
    let id: number;
    this.permissionsEnum = [];
    for (const feature of Object.values(Feature)) {
      this.groupedPermissions[feature] = [];
      for (const action of Object.values(Action)) {
        id = permissionsIds[action + ' ' + feature];
        //check if permission exist
        if (!id) continue;
        isSelected =
          partial.permissions.findIndex((permission) => permission.id == id) !=
          -1;
        if (isSelected)
          this.permissionsEnum.push(
            action.toUpperCase() +
              '_' +
              feature.toUpperCase().replaceAll(' ', '_'),
          );
        this.groupedPermissions[feature].push(
          PermissionEntity.createInstance({
            id: id,
            title: action + ' ' + feature,
            isSelected: isSelected,
          }),
        );
      }
    }
    Object.assign(this, partial);
  }
  static createInstance(
    payload: Partial<Role>,
    permissionsIds: { [key: string]: number },
  ): RoleEntity;
  static createInstance(
    payload: Partial<Role>[],
    permissionsIds: { [key: string]: number },
  ): RoleEntity[];
  static createInstance(
    payload: Partial<Role> | Partial<Role>[],
    permissionsIds: { [key: string]: number },
  ) {
    if (Array.isArray(payload)) {
      return payload.map((item) => {
        return instanceToPlain(new this(item, permissionsIds));
      });
    }
    return instanceToPlain(new this(payload, permissionsIds));
  }
}
