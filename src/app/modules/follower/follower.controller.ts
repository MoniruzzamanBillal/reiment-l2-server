import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { followerService } from "./follower.service";

// ! get logged in user follower data
const getLoggedUserData = catchAsync(async (req, res) => {
  const result = await followerService.getLoggedUserFollowShop(
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Logged In user follower data retrived successfully!!!",
    data: result,
  });
});

// ! for following a shop
const followShop = catchAsync(async (req, res) => {
  const result = await followerService.followShop(
    req.body?.shopId,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Followed to shop successfully!!!",
    data: result,
  });
});

// ! for unfollowing a shop
const unfollowShop = catchAsync(async (req, res) => {
  const result = await followerService.unfollowShop(
    req.body?.shopId,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "UnFollowed to shop successfully!!!",
    data: result,
  });
});

//
export const followerController = {
  followShop,
  unfollowShop,
  getLoggedUserData,
};
