import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";

// ! for ordering product
const orderItem = async (payload: { cartId: string }, userId: string) => {
  const { cartId } = payload;
  // get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cartId },
  });

  if (!cartItems.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const result = prisma.$transaction(async (trxnClient) => {
    // create order data
    const order = await trxnClient.order.create({
      data: {
        customerId: userId,
        totalPrice,
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

    await trxnClient.cart.delete({
      where: {
        id: cartId,
      },
    });

    return order;
  });

  return result;
};

//
export const orderServices = {
  orderItem,
};
