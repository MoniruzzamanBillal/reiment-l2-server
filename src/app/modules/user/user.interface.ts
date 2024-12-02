import { UserRole, UserStatus } from "@prisma/client";

export type TUser = {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImg?: string | null;
  role: UserRole;
  status: UserStatus;
};

export type TLogin = {
  email: string;
  password: string;
};
