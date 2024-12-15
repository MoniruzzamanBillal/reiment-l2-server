"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRouter = void 0;
const express_1 = require("express");
const test_route_1 = require("../modules/boilerModule/test.route");
const user_route_1 = require("../modules/user/user.route");
const auth_router_1 = require("../modules/auth/auth.router");
const admin_route_1 = require("../modules/admin/admin.route");
const category_route_1 = require("../modules/category/category.route");
const shop_route_1 = require("../modules/shop/shop.route");
const product_route_1 = require("../modules/products/product.route");
const cart_route_1 = require("../modules/cart/cart.route");
const order_route_1 = require("../modules/order/order.route");
const payment_route_1 = require("../modules/payment/payment.route");
const address_route_1 = require("../modules/address/address.route");
const review_route_1 = require("../modules/review/review.route");
const follower_route_1 = require("../modules/follower/follower.route");
const coupon_route_1 = require("../modules/coupon/coupon.route");
const router = (0, express_1.Router)();
const routeArray = [
    {
        path: "/test",
        route: test_route_1.testRouter,
    },
    {
        path: "/auth",
        route: auth_router_1.authRouter,
    },
    {
        path: "/admin",
        route: admin_route_1.adminRouter,
    },
    {
        path: "/user",
        route: user_route_1.userRouter,
    },
    {
        path: "/category",
        route: category_route_1.categoryRouter,
    },
    {
        path: "/shop",
        route: shop_route_1.shopRouter,
    },
    {
        path: "/product",
        route: product_route_1.productRouter,
    },
    {
        path: "/cart",
        route: cart_route_1.cartRouter,
    },
    {
        path: "/order",
        route: order_route_1.orderRouter,
    },
    {
        path: "/payment",
        route: payment_route_1.paymentRouter,
    },
    {
        path: "/address",
        route: address_route_1.addressRouter,
    },
    {
        path: "/review",
        route: review_route_1.reviewRouter,
    },
    {
        path: "/follow",
        route: follower_route_1.followerRouter,
    },
    {
        path: "/coupon",
        route: coupon_route_1.couponRouter,
    },
];
routeArray.forEach((item) => {
    router.use(item.path, item.route);
});
exports.MainRouter = router;
