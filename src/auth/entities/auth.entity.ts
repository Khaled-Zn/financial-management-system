import { Exclude, instanceToPlain } from 'class-transformer';

interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
}
export class UserEntity {
  id: number;
  email: string;

  @Exclude()
  password: string;

  fullName: string;

  static createInstance(payload: User): UserEntity;
  static createInstance(payload: User[]): UserEntity[];
  static createInstance(payload: User | User[]) {
    if (Array.isArray(payload)) {
      return payload.map((item) => instanceToPlain(new this(item)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }
  private constructor(obj: User) {
    this.id = obj.id;
    this.email = obj.email;
    this.fullName = obj.fullName;
    this.password = obj.password;
  }
}
