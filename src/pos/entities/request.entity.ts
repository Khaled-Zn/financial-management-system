import { instanceToPlain } from 'class-transformer';
import transformItems, {
  ItemWithItsSpecification,
} from 'src/global/utils/transform-itmes';
import { ItemEntity } from 'src/items-center/entities/items-center.entity';

// type Item = {
//   id: number;
//   type: ItemsType;
//   name: string;
//   description: string;
//   cost: number;
//   deleted: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// };
// type InventoryPosRequest = {
//   specification: {
//     id: number;
//     colorName: string;
//     size: string;
//     itemId: number;
//   };
//   item: Item;
//   quantity: number;
// };

type Invetory = {
  name: string;
  id: number;
  address: string;
};

type Pos = {
  name: string;
  id: number;
  address: string;
};

type Request = {
  id: number;
  from: Pos | Invetory;
  to: Pos | Invetory;
  createdAt: Date;
  inventoryPosItemRequest: ItemWithItsSpecification[];
};

export class RequestEntity {
  id: number;
  from: Pos | Invetory;
  to: Pos | Invetory;
  items: ItemEntity[];

  date: string;

  constructor(request: Request) {
    this.id = request.id;
    this.from = request.from;
    this.to = request.to;
    this.date = request.createdAt.toUTCString();
    this.items = transformItems(request.inventoryPosItemRequest);
  }

  static createInstance(payload: Request): RequestEntity;
  static createInstance(payload: Request[]): RequestEntity[];
  static createInstance(payload: Request | Request[]) {
    if (Array.isArray(payload)) {
      return payload.map((request) => instanceToPlain(new this(request)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }

  // private setItems(items: InventoryPosRequest[]) {
  //   return items.map((item) => {
  //     const payload = {
  //       ...item.item,
  //       specifications: [{ ...item.specification, quantity: item.quantity }],
  //     };
  //     return ItemEntity.createInstance(payload);
  //   });
  // }
}
