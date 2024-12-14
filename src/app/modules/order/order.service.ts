import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { initiatePayment } from "../payment/payment.util";

// ! for ordering product
const orderItem = async (
  payload: { cartId: string; cuponId?: string },
  userId: string
) => {
  const { cartId, cuponId } = payload;

  const trxnNumber = `TXN-${Date.now()}`;

  let discountValue = 0;

  if (cuponId) {
    const couponData = await prisma.coupon.findUnique({
      where: {
        id: cuponId,
      },
    });
    discountValue = couponData?.discountValue as number;
  }

  // get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cartId },
  });

  if (!cartItems.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  let totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  totalPrice -= discountValue;

  const result = prisma.$transaction(async (trxnClient) => {
    // create order data
    const order = await trxnClient.order.create({
      data: {
        customerId: userId,
        totalPrice,
        trxnNumber,
      },
    });

    // crete order item data
    const orderItems = cartItems.map((item) => ({
      orderId: order?.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    // create order item
    await trxnClient.orderItem.createMany({ data: orderItems });

    // delete cart item
    await trxnClient.cartItem.deleteMany({
      where: {
        cartId,
      },
    });

    // delete cart
    await trxnClient.cart.delete({
      where: {
        id: cartId,
      },
    });

    // reduce product inventory quantity
    for (const item of cartItems) {
      await trxnClient.products.update({
        where: { id: item?.productId },
        data: {
          inventoryCount: {
            decrement: item?.quantity,
          },
        },
      });
    }

    const userData = await trxnClient.user.findUnique({
      where: { id: userId },
    });

    // * initiate payment
    const tracsactionData = {
      transactionId: trxnNumber,
      amount: totalPrice as number,
      customerName: userData?.username as string,
      customerEmail: userData?.email as string,
      userId: userId,
    };

    const transactionResult = await initiatePayment(tracsactionData);

    if (transactionResult?.tran_id) {
      throw new AppError(httpStatus.BAD_REQUEST, transactionResult?.tran_id);
    }

    return transactionResult;
  });

  return result;
};

// ! for getting user order
const getOrder = async (userId: string) => {
  const result = await prisma.order.findMany({
    where: {
      customerId: userId,
      isDelated: false,
    },
    include: {
      orderItem: true,
    },
  });

  return result;
};

// ! for getting vendor shops order item products
const getVendorOrderHistory = async (vendorUserId: string) => {
  const shop = await prisma.shop.findUnique({
    where: {
      vendorId: vendorUserId,
    },
  });

  if (!shop) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Shop not found for this vendor."
    );
  }

  const orderItems = prisma.order.findMany({
    where: {
      orderItem: {
        some: {
          product: {
            shopId: shop?.id,
          },
        },
      },
    },
    include: {
      orderItem: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orderItems;
};

//
export const orderServices = {
  orderItem,
  getOrder,
  getVendorOrderHistory,
};
