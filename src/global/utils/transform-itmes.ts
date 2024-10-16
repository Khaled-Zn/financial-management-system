import { ItemEntity } from 'src/items-center/entities/items-center.entity';

export type ItemWithItsSpecification = {
  specification: {
    id: number;
    colorName: string;
    size: string;
    itemId: number;
  };
  item: {
    id: number;
    name: string;
    description: string;
    cost: number;
    createdAt: Date;
  };
  quantity: number;
  price?: number;
};

export default function transformItems(
  items: ItemWithItsSpecification[],
): ItemEntity[] {
  const groupedItems = {};

  items.forEach(({ quantity, item, specification, price }) => {
    if (!groupedItems[item.id]) {
      groupedItems[item.id] = {
        id: item.id,
        name: item.name,
        description: item.description,
        cost: item.cost,
        specification: [],
      };
    }

    const colorSpec = groupedItems[item.id].specification.find(
      (spec) => spec.colorName === specification.colorName,
    );

    if (colorSpec) {
      colorSpec.sizesSpecification.push({
        id: specification.id,
        quantity,
        sizeName: specification.size,
        price: price,
      });
    } else {
      groupedItems[item.id].specification.push({
        colorName: specification.colorName,
        sizesSpecification: [
          {
            id: specification.id,
            quantity,
            sizeName: specification.size,
            price: price,
          },
        ],
      });
    }
  });

  return Object.values(groupedItems);
}
