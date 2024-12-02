import { Router } from "express";
import { testRouter } from "../modules/boilerModule/test.route";
import { userRouter } from "../modules/user/user.route";
import { authRouter } from "../modules/auth/auth.router";
import { adminRouter } from "../modules/admin/admin.route";
import { categoryRouter } from "../modules/category/category.route";
import { shopRouter } from "../modules/shop/shop.route";

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
];

routeArray.forEach((item) => {
  router.use(item.path, item.route);
});

export const MainRouter = router;
