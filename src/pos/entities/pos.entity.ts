import { instanceToPlain } from 'class-transformer';
import transformItems, {
  ItemWithItsSpecification,
} from 'src/global/utils/transform-itmes';
import { ItemEntity } from 'src/items-center/entities/items-center.entity';

type Invetory = {
  name: string;
  id: number;
  address: string;
};
type InventoriesBelongToPos = {
  inventory: Invetory;
};

type Pos = {
  id: number;
  name: string;
  address: string;
  posHas: InventoriesBelongToPos[];
  InventoryPosItems: ItemWithItsSpecification[];
};
export class PosEntity {
  id: number;
  name: string;
  address: string;
  items: ItemEntity[];
  inventories: Invetory[];

  constructor(pos: Pos) {
    this.id = pos.id;
    this.name = pos.name;
    this.address = pos.address;
    this.items = transformItems(pos.InventoryPosItems);
    this.inventories = pos.posHas.map((inventory) => inventory.inventory);
  }

  static createInstance(payload: Pos): PosEntity;
  static createInstance(payload: Pos[]): PosEntity[];
  static createInstance(payload: Pos | Pos[]) {
    if (Array.isArray(payload)) {
      return payload.map((pos) => instanceToPlain(new this(pos)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }
}
