import { Router } from "express";
import { testRouter } from "../modules/boilerModule/test.route";
import { userRouter } from "../modules/user/user.route";
import { authRouter } from "../modules/auth/auth.router";

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
    path: "/user",
    route: userRouter,
  },
];

routeArray.forEach((item) => {
  router.use(item.path, item.route);
});

export const MainRouter = router;
