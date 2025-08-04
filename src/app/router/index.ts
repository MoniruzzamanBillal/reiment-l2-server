import { Router } from "express";
import { addressRouter } from "../modules/address/address.route";
import { adminRouter } from "../modules/admin/admin.route";
import { authRouter } from "../modules/auth/auth.router";
import { testRouter } from "../modules/boilerModule/test.route";
import { cartRouter } from "../modules/cart/cart.route";
import { categoryRouter } from "../modules/category/category.route";
import { couponRouter } from "../modules/coupon/coupon.route";
import { followerRouter } from "../modules/follower/follower.route";
import { orderRouter } from "../modules/order/order.route";
import { paymentRouter } from "../modules/payment/payment.route";
import { productRouter } from "../modules/products/product.route";
import { reviewRouter } from "../modules/review/review.route";
import { shopRouter } from "../modules/shop/shop.route";
import { userRouter } from "../modules/user/user.route";

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
