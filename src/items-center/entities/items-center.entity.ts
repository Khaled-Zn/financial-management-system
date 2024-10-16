import {
  ClothesSpecification,
  Item as ItemPrisma,
  ItemsType,
} from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import { groupBy } from 'lodash';

type Item = ItemPrisma & { specifications: ClothesSpecification[] };

class SizesSpecification {
  id: number;
  sizeName: string;
  quantity?: number;
  price?: number;
  constructor(
    sizeSpecification: Pick<ClothesSpecification, 'id' | 'size'> & {
      quantity?: number;
      price?: number;
    },
  ) {
    this.id = sizeSpecification.id;
    this.quantity = sizeSpecification.quantity;
    this.sizeName = sizeSpecification.size;
    this.price = sizeSpecification.price;
  }
}

class ItmeSpecifications {
  colorName: string;
  sizesSpecification: SizesSpecification[];
  constructor(specification: ItmeSpecifications) {
    this.colorName = specification.colorName;
    this.sizesSpecification = specification.sizesSpecification;
  }
}

export class ItemEntity {
  id: number;
  name: string;
  type: ItemsType;
  description: string;
  cost: number;
  specification: ItmeSpecifications[];

  constructor(item: Item & { quantity?: number; price?: number }) {
    this.id = item.id;
    this.type = item.type;
    this.name = item.name;
    this.description = item.description;
    this.cost = item.cost;
    this.specification = this.setSpecification(item.specifications);
  }

  static createInstance(payload: Item): ItemEntity;
  static createInstance(payload: Item[]): ItemEntity[];
  static createInstance(payload: Item | Item[]) {
    if (Array.isArray(payload)) {
      return payload.map((item) => instanceToPlain(new this(item)));
    } else {
      return instanceToPlain(new this(payload));
    }
  }

  private setSpecification(
    specification: (ClothesSpecification & {
      quantity?: number;
      price?: number;
    })[],
  ) {
    const groupedSpecification = groupBy(specification, 'colorName');
    const specificationKeys = Object.keys(groupedSpecification);
    return specificationKeys.map(
      (key) =>
        new ItmeSpecifications({
          colorName: key,
          sizesSpecification: groupedSpecification[key].map(
            (size) =>
              new SizesSpecification({
                id: size.id,
                size: size.size,
                quantity: size.quantity ?? null,
                price: size.price ?? null,
              }),
          ),
        }),
    );
  }
}
