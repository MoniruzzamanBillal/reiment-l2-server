import Jwt from "jsonwebtoken";

export const createToken = (
  payload: { userId: string; userEmail: string; userRole: string },
  secret: string,
  expire?: string
) => {
  return Jwt.sign(payload, secret, { expiresIn: "20d" });
};
