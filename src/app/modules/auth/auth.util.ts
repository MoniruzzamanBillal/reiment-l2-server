import Jwt from "jsonwebtoken";

export const createToken = (
  payload: { userId: string; userEmail: string },
  secret: string,
  expire: string
) => {
  return Jwt.sign(payload, secret, { expiresIn: expire });
};
