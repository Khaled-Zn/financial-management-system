// import { ItemsType } from '@prisma/client';
// import { instanceToPlain } from 'class-transformer';
// import { ItemEntity } from 'src/items-center/entities/items-center.entity';

// type Pos = {
//   id: number;
//   name: string;
//   address: string;
// };

// type SaleItem = {
//   specification: {
//     id: number;
//     colorName: string;
//     size: string;
//     itemId: number;
//   };
//   item: {
//     id: number;
//     type: ItemsType;
//     name: string;
//     description: string;
//     cost: number;
//     deleted: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//   };
// };

// type Sale = {
//   id: number;
//   price: number;
//   quantity: number;
//   createdAt: Date;
//   inventoryOrPos: Pos;
//   specification: {
//     id: number;
//     colorName: string;
//     size: string;
//     itemId: number;
//   };
//   item: {
//     id: number;
//     type: ItemsType;
//     name: string;
//     description: string;
//     cost: number;
//     deleted: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//   };
// };

// export class SaleEntity {
//   id: number;
//   price: number;
//   createdAt: Date;
//   pos: Pos;
//   item: ItemEntity;

//   static createInstance(payload: Sale): SaleEntity;
//   static createInstance(payload: Sale[]): SaleEntity[];
//   static createInstance(payload: Sale | Sale[]) {
//     if (Array.isArray(payload)) {
//       return payload.map((itemm) => instanceToPlain(new this(itemm)));
//     } else {
//       return instanceToPlain(new this(payload));
//     }
//   }
//   private constructor(obj: Sale) {
//     this.id = obj.id;
//     this.price = obj.price;
//     this.createdAt = obj.createdAt;
//     this.pos = obj.inventoryOrPos;
//     this.item = this.setItem({
//       item: obj.item,
//       specification: obj.specification,
//     });
//   }

//   private setItem(item: SaleItem) {
//     const payload = {
//       ...item.item,
//       specifications: [{ ...item.specification }],
//     };
//     return ItemEntity.createInstance(payload);
//   }
// }
