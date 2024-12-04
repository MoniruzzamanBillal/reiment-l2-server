import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TCart, TDeleteCartItem, TReplaceCart } from "./cart.interface";

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

// ! for replacing cart
const replaceCart = async (payload: TReplaceCart) => {
  // check for product
  const productData = await prisma.products.findUnique({
    where: { id: payload?.productId, isDelated: false },
    include: { shop: true },
  });

  if (!productData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found");
  }

  // delete cart previous cart item
  await prisma.cartItem.deleteMany({ where: { cartId: payload.cartId } });
  // update new vendor
  await prisma.cart.update({
    where: { id: payload.cartId },
    data: { vendorId: productData?.shop?.id },
  });

  // Add the new product to the cartItem
  await prisma.cartItem.create({
    data: {
      cartId: payload.cartId,
      productId: productData.id,
      quantity: payload.quantity,
      price: productData.price,
    },
  });
};

// ! for getting cart data
const getCartData = async (userId: string) => {
  const cartData = await prisma.cart.findUnique({
    where: {
      customerId: userId,
      isDelated: false,
    },
    include: { cartItem: true },
  });

  return cartData;
};

// ! for deleting cart item
const deleteCartItem = async (payload: TDeleteCartItem, userId: string) => {
  const cartData = await prisma.cart.findUnique({
    where: { id: payload.cartId, customerId: userId },
  });

  const cartItemData = await prisma.cartItem.findUnique({
    where: { id: payload.cartItemId, cartId: payload.cartId },
  });

  if (!cartData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart  not found");
  }

  if (!cartItemData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart item not found");
  }
};

//
export const cartServices = {
  addToCart,
  replaceCart,
  getCartData,
  deleteCartItem,
};
