import { Decimal } from "@prisma/client/runtime/library";

export type TCart = {
  productId: string;
  quantity: number;
};

export type TReplaceCart = {
  cartId: string;
  productId: string;
  quantity: number;
};

export type TDeleteCartItem = {
  cartItemId: string;
  cartId: string;
};

export type CartItem = {
  cartId: string;
  productId: string;
  quantity: number;
  price: Decimal;
};
