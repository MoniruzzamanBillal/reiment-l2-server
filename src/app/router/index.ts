import { Router } from "express";
import { testRouter } from "../modules/boilerModule/test.route";
import { userRouter } from "../modules/user/user.route";
import { authRouter } from "../modules/auth/auth.router";
import { adminRouter } from "../modules/admin/admin.route";
import { categoryRouter } from "../modules/category/category.route";
import { shopRouter } from "../modules/shop/shop.route";
import { productRouter } from "../modules/products/product.route";
import { cartRouter } from "../modules/cart/cart.route";
import { orderRouter } from "../modules/order/order.route";
import { paymentRouter } from "../modules/payment/payment.route";
import { addressRouter } from "../modules/address/address.route";
import { reviewRouter } from "../modules/review/review.route";
import { followerRouter } from "../modules/follower/follower.route";
import { couponRouter } from "../modules/coupon/coupon.route";

const router = Router();

const routeArray = [
  {
    path: "/test",
    route: testRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/admin",
    route: adminRouter,
  },
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/category",
    route: categoryRouter,
  },
  {
    path: "/shop",
    route: shopRouter,
  },
  {
    path: "/product",
    route: productRouter,
  },
  {
    path: "/cart",
    route: cartRouter,
  },
  {
    path: "/order",
    route: orderRouter,
  },
  {
    path: "/payment",
    route: paymentRouter,
  },
  {
    path: "/address",
    route: addressRouter,
  },
  {
    path: "/review",
    route: reviewRouter,
  },
  {
    path: "/follow",
    route: followerRouter,
  },
  {
    path: "/coupon",
    route: couponRouter,
  },
];

routeArray.forEach((item) => {
  router.use(item.path, item.route);
});

export const MainRouter = router;
