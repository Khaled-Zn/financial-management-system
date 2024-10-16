import { instanceToPlain } from 'class-transformer';

interface Permission {
  id: number;
  title: string;
  isSelected: boolean;
}

export class PermissionEntity {
  id: number;
  title: string;
  isSelected: boolean;

  constructor(partial: Partial<Permission>) {
    //partial['isSelected'] = false;
    this.isSelected = false;
    Object.assign(this, partial);
  }
  static createInstance(payload: Partial<Permission>): PermissionEntity;
  static createInstance(payload: Partial<Permission>[]): PermissionEntity[];
  static createInstance(payload: Partial<Permission> | Partial<Permission>[]) {
    if (Array.isArray(payload)) {
      return payload.map((item) => {
        return instanceToPlain(new this(item));
      });
    }
    return instanceToPlain(new this(payload));
  }
}
