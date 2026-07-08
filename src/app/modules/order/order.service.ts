import { OrderStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { assertCouponDatesValid } from "../coupon/coupon.service";
import prisma from "../../util/prisma";
import { initPayment } from "../payment/payment.util";
import { TOrderPayload } from "./order.interface";

// ! for ordering product
const orderItem = async (payload: TOrderPayload, userId: string) => {
  const { cartId, couponId } = payload;

  const trxnNumber = `TXN-${Date.now()}`;

  // get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cartId },
  });

  if (!cartItems.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const baseTotalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const result = await prisma.$transaction(async (trxnClient) => {
    let discountAmount = 0;

    if (couponId) {
      // re-validate inside the transaction — a preview earlier isn't a guarantee at commit time
      const coupon = await trxnClient.coupon.findFirst({
        where: { id: couponId, isDeleted: false },
      });

      if (!coupon) {
        throw new AppError(httpStatus.NOT_FOUND, "Coupon code not found.");
      }

      assertCouponDatesValid(coupon);

      // atomic system-wide claim: only succeeds if a slot is still available,
      // so concurrent checkouts serialize on the row lock instead of over-claiming
      const claim = await trxnClient.coupon.updateMany({
        where: { id: couponId, usedCount: { lt: coupon.usageLimit } },
        data: { usedCount: { increment: 1 } },
      });

      if (claim.count === 0) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "This coupon has reached its maximum usage limit and can no longer be used."
        );
      }

      discountAmount = coupon.discountValue;
    }

    const totalPrice = baseTotalPrice - discountAmount;

    // create order data
    const order = await trxnClient.order.create({
      data: {
        customerId: userId,
        totalPrice,
        trxnNumber,
        couponId: couponId ?? null,
        discountAmount,
      },
    });

    if (couponId) {
      // atomic per-user claim — the [couponId, userId] unique constraint is the
      // enforcement point; a violation here rolls back the usedCount increment
      // and order creation above, together, since it's all one transaction
      try {
        await trxnClient.couponUsage.create({
          data: { couponId, userId, orderId: order.id },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "You have already used this coupon."
          );
        }
        throw error;
      }
    }

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

    const transactionResult = await initPayment(tracsactionData);

    console.log(transactionResult);

    if (transactionResult?.tran_id) {
      throw new AppError(httpStatus.BAD_REQUEST, transactionResult?.tran_id);
    }

    return transactionResult;
  }, { timeout: 20000 });

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
      orderItem: {
        include: {
          product: true,
        },
      },
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

// ! for getting all transaction data
const getAllTransactionData = async () => {
  const result = await prisma.order.findMany({
    where: { isDelated: false, status: OrderStatus.COMPLETED },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

//
export const orderServices = {
  orderItem,
  getOrder,
  getVendorOrderHistory,
  getAllTransactionData,
};
