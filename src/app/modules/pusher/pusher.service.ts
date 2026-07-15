import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import pusherServer from "../../util/pusher";

const VENDOR_CHANNEL_PREFIX = "private-vendor-";
const CUSTOMER_CHANNEL_PREFIX = "private-customer-";

// ! for authorizing a private channel subscription request from pusher-js
const authorizeChannel = async (
  socketId: string,
  channelName: string,
  user: JwtPayload
) => {
  if (channelName.startsWith(VENDOR_CHANNEL_PREFIX)) {
    const requestedShopId = channelName.slice(VENDOR_CHANNEL_PREFIX.length);

    const shop = await prisma.shop.findUnique({
      where: { vendorId: user.userId },
    });

    if (!shop || shop.id !== requestedShopId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to subscribe to this channel."
      );
    }
  } else if (channelName.startsWith(CUSTOMER_CHANNEL_PREFIX)) {
    const requestedUserId = channelName.slice(CUSTOMER_CHANNEL_PREFIX.length);

    if (requestedUserId !== user.userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to subscribe to this channel."
      );
    }
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Unknown channel.");
  }

  return pusherServer.authorizeChannel(socketId, channelName);
};

//
export const pusherServices = {
  authorizeChannel,
};
