import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TCart } from "./cart.interface";

// ! for adding to cart
const addToCart = async (payload: TCart, userId: string) => {
  // check for product
  const productData = await prisma.products.findUnique({
    where: { id: payload?.productId, isDelated: false },
    include: { shop: true },
  });

  if (!productData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found");
  }

  if (productData.inventoryCount < payload.quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient inventory");
  }

  // check for cart data
  let cartData = await prisma.cart.findUnique({
    where: { customerId: userId },
  });
  console.log(productData?.shop?.vendorId);
  // for no cart data , create cart data
  if (!cartData) {
    cartData = await prisma.cart.create({
      data: {
        customerId: userId,
        vendorId: productData?.shop?.id,
      },
    });
  }

  // Ensure single vendor per cart
  if (cartData.vendorId !== productData.shop.id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only add products from a single vendor to the cart."
    );
  }

  // Add item to cart
  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cartData.id, productId: payload.productId },
    },
    update: { quantity: { increment: payload.quantity } },
    create: {
      cartId: cartData.id,
      productId: payload.productId,
      quantity: payload.quantity,
      price: productData.price,
    },
  });

  //
};

//
export const cartServices = {
  addToCart,
};
