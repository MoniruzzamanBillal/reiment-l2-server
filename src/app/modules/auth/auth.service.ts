import * as bcrypt from "bcrypt";
import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TLogin, TUser } from "../user/user.interface";
import { UserStatus } from "@prisma/client";
import AppError from "../../Error/AppError";
import httpStatus from "http-status";
import { createToken } from "./auth.util";
import config from "../../config";

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
    const name = payload?.username.trim();
    const path = (file?.path as string).trim();

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

// ! for updating a user
const updateUser = async (
  payload: { name: string; email: string; profileImg?: string },
  file: Partial<IFile> | undefined,
  userId: string
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      isDelated: false,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, "User dont exist !!");
  }

  if (file) {
    const name = userData?.username.trim();
    const path = (file?.path as string).trim();

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    const profileImg = cloudinaryResponse?.secure_url;
    payload.profileImg = profileImg;
  }
  console.log(payload);
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
  });

  console.log(result);

  return result;
};

// ! login
const login = async (payload: TLogin) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
      isDelated: false,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User dont exist !!");
  }

  const { password: userPassword, ...userData } = user;

  const isPasswordMatch = await bcrypt.compare(payload?.password, userPassword);

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, "Password don't match !!");
  }

  const jwtPayload = {
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
  };

  const token = createToken(jwtPayload, config.jwt_secret as string, "20d");

  return {
    userData,
    token,
  };
};

//
export const authServices = {
  createUser,
  login,
  updateUser,
};
