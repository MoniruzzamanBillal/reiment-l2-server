export type TShop = {
  shopId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  inventoryCount: number;
  discount?: number;
  productImg?: string;
};
