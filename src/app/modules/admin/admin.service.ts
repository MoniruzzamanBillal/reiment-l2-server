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
  const revenueDataPrice = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { isDelated: false },
  });

  const totalRevenue = revenueDataPrice?._sum.totalPrice || 0;

  const statsData = [
    { totalUsers },
    { activeVendors },
    { blockedVendors },
    { totalOrders },
    { totalRevenue },
  ];

  const revenueData = await prisma.order.groupBy({
    by: ["createdAt"],
    _sum: { totalPrice: true },
    _count: { id: true },
    where: { isDelated: false },
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyStats: { [key: string]: { revenue: number; orders: number } } =
    {};

  revenueData?.forEach((item) => {
    const monthIndex = new Date(item?.createdAt).getMonth();
    const monthName = monthNames[monthIndex];

    if (!monthlyStats[monthName]) {
      monthlyStats[monthName] = { revenue: 0, orders: 0 };
    }

    monthlyStats[monthName].revenue += item?._sum?.totalPrice || 0;
    monthlyStats[monthName].orders += item?._count?.id || 0;
  });

  const revenueDatas = Object.entries(monthlyStats)?.map(([month, value]) => ({
    month,
    revenue: value?.revenue,
    orders: value?.orders,
  }));

  return {
    statsData,
    revenueDatas,
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
