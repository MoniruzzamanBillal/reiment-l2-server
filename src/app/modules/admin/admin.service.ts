import { ShopStatus, UserRole, UserStatus } from "@prisma/client";
import prisma from "../../util/prisma";

// ! for getting admin statistics
const getAdminStatistics = async () => {
  // Count total users
  const totalUsers = await prisma.user.count({
    where: { isDelated: false },
  });

  // Count active vendors
  const activeVendors = await prisma.user.count({
    where: {
      role: UserRole.VENDOR,
      status: UserStatus.ACTIVE,
      isDelated: false,
    },
  });

  // Count blocked vendors
  const blockedVendors = await prisma.user.count({
    where: {
      role: UserRole.VENDOR,
      status: UserStatus.BLOCKED,
      isDelated: false,
    },
  });

  // Count total orders
  const totalOrders = await prisma.order.count({
    where: { isDelated: false },
  });

  // Calculate total revenue (sum of order totalPrice for non-deleted orders)
  const revenueData = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { isDelated: false },
  });

  const totalRevenue = revenueData._sum.totalPrice || 0;

  const statsData = [
    { totalUsers },
    { activeVendors },
    { blockedVendors },
    { totalOrders },
    { totalRevenue },
  ];

  return {
    statsData,
  };
};

// ! for deleting a user
const deleteUser = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId, isDelated: false, status: UserStatus.ACTIVE },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { isDelated: true },
  });
};

// ! for blocking a user
const blockUser = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId, isDelated: false, status: UserStatus.ACTIVE },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { status: UserStatus.BLOCKED },
  });
};

// ! for blocking vendor shop
const blockVendorShop = async (shopId: string) => {
  // npx prisma generate
  await prisma.shop.findUniqueOrThrow({
    where: { id: shopId, status: ShopStatus.ACTIVE },
  });
  await prisma.shop.update({
    where: { id: shopId },
    data: { status: ShopStatus.BLOCKED },
  });
};

//
export const adminService = {
  deleteUser,
  blockUser,
  blockVendorShop,
  getAdminStatistics,
};
