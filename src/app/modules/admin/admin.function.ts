import prisma from "../../util/prisma";

// ! for getting revenue data ,
export const getRevenueData = async () => {
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

  return revenueDatas;
};

// ! for getting category product percentage
export const getCategoryProductPercentageFunc = async () => {
  const categoryCounts = await prisma.categories.findMany({
    select: {
      name: true,
      products: {
        where: { isDelated: false },
        select: { id: true },
      },
    },
  });

  const totalProducts = categoryCounts.reduce(
    (sum, cat) => sum + cat?.products.length,
    0
  );

  return categoryCounts.map((cat) => ({
    name: cat?.name,
    value:
      totalProducts > 0
        ? Math.round((cat?.products?.length / totalProducts) * 100)
        : 0,
  }));
};
