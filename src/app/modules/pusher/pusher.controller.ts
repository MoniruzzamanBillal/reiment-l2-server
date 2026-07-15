import catchAsync from "../../util/catchAsync";
import { pusherServices } from "./pusher.service";

// ! for authorizing a pusher private channel subscription
// note: responds with the raw pusher auth payload, not the app's sendResponse
// envelope — pusher-js's client requires the exact `{ auth: "..." }` shape
const authorizeChannel = catchAsync(async (req, res) => {
  const { socket_id, channel_name } = req.body;

  const authResponse = await pusherServices.authorizeChannel(
    socket_id,
    channel_name,
    req.user
  );

  res.status(200).send(authResponse);
});

//
export const pusherController = {
  authorizeChannel,
};
