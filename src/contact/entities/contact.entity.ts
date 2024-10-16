import { instanceToPlain } from 'class-transformer';

interface Contact {
  id: number;
  email: string;
  fullName: string;
  phone: string;
}
export class ContactEntity {
  id: number;
  email: string;
  fullName: string;
  phone: string;

  static createInstance(payload: Contact): ContactEntity;
  static createInstance(payload: Contact[]): ContactEntity[];
  static createInstance(payload: Contact | ContactEntity[]) {
    if (Array.isArray(payload)) {
      return payload.map((item) => instanceToPlain(new this(item)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }
  private constructor(obj: Contact) {
    this.id = obj.id;
    this.email = obj.email;
    this.fullName = obj.fullName;
    this.phone = obj.phone;
  }
}
