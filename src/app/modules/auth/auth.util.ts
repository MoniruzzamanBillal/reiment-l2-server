import Jwt from "jsonwebtoken";

export const createToken = (
  payload: { userId: string; userEmail: string; userRole: string },
  secret: string
) => {
  return Jwt.sign(payload, secret, { expiresIn: "20d" });
};
