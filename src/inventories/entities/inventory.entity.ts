import { instanceToPlain } from 'class-transformer';
import transformItems, {
  ItemWithItsSpecification,
} from 'src/global/utils/transform-itmes';
import { ItemEntity } from 'src/items-center/entities/items-center.entity';

type Invetory = {
  name: string;
  id: number;
  InventoryPosItems: ItemWithItsSpecification[];
  address: string;
};
export class InventoryEntity {
  id: number;
  name: string;
  address: string;
  items: ItemEntity[];

  constructor(inventory: Invetory) {
    this.id = inventory.id;
    this.name = inventory.name;
    this.address = inventory.address;
    this.items = transformItems(inventory.InventoryPosItems);
  }

  static createInstance(payload: Invetory): InventoryEntity;
  static createInstance(payload: Invetory[]): InventoryEntity[];
  static createInstance(payload: Invetory | Invetory[]) {
    if (Array.isArray(payload)) {
      return payload.map((inventory) => instanceToPlain(new this(inventory)));
    } else {
      if (!payload) return {};
      return instanceToPlain(new this(payload));
    }
  }
}
