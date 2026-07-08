export type TCoupon = {
  code: string;
  discountValue: number;
  usageLimit: number;
  startDate: Date;
  endDate: Date;
};

export type TCouponUpdate = Partial<TCoupon>;
