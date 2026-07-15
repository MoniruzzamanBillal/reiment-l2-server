import Pusher from "pusher";
import config from "../config";

const pusherServer = new Pusher({
  appId: config.PUSHER_APP_ID as string,
  key: config.PUSHER_KEY as string,
  secret: config.PUSHER_SECRET as string,
  cluster: config.PUSHER_CLUSTER as string,
  useTLS: true,
});

export default pusherServer;
