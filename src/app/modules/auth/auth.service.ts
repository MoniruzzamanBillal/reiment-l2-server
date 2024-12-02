import * as bcrypt from "bcrypt";
import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TUser } from "../user/user.interface";

// ! for creating user
const createUser = async (
  payload: Partial<TUser>,
  file: Partial<IFile> | undefined
) => {
  if (!payload.username || !payload.email || !payload.password) {
    throw new Error("Missing required fields: username, email, or password");
  }

  let profileImg;

  if (file) {
    const name = payload?.username;
    const path = file?.path;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    profileImg = cloudinaryResponse?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(payload?.password, 20);

  payload.password = hashedPassword;

  const result = await prisma.user.create({
    data: {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      profileImg,
    },
  });

  return result;
};

//
export const authServices = {
  createUser,
};
