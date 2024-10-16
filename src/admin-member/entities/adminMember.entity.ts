import { instanceToPlain } from 'class-transformer';

type AdminMember = {
  id: number;
  email: string;
  password: string;
  fullName: string;
  phonenumber: string;
};

export class AdminMemberEntity {
  id: number;
  email: string;
  password: string;
  fullName: string;
  phonenumber: string;

  static createInstance(payload: AdminMember): AdminMemberEntity;
  static createInstance(payload: AdminMember[]): AdminMemberEntity[];
  static createInstance(payload: AdminMember | AdminMember[]) {
    if (Array.isArray(payload)) {
      return payload.map((item) => instanceToPlain(new this(item)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }
  private constructor(obj: AdminMember) {
    this.id = obj.id;
    this.email = obj.email;
    this.password = '';
    this.fullName = obj.fullName;
    this.phonenumber = obj.phonenumber;
  }
}
