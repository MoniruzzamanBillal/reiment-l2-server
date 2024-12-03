import { Decimal } from "@prisma/client/runtime/library";

export type TCart = {
  id: string;

  vendorId?: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: Decimal;
};
