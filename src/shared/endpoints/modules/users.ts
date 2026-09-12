import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  AuthResponse,
  ChangePasswordBody,
  DeleteUserDataBody,
  DeleteUserDataResponse,
  LoginBody,
  RegisterBody,
  User,
} from "@/shared/types";

export const usersModule = {
  register: defineEndpoint<AuthResponse, RegisterBody>({
    method: "POST",
    path: ROUTES.users.register,
    auth: false,
  }),

  login: defineEndpoint<AuthResponse, LoginBody>({
    method: "POST",
    path: ROUTES.users.login,
    auth: false,
  }),

  getMe: defineEndpoint<User>({
    method: "GET",
    path: ROUTES.users.me,
    auth: true,
  }),

  changePassword: defineEndpoint<void, ChangePasswordBody>({
    method: "PATCH",
    path: ROUTES.users.changePassword,
    auth: true,
  }),

  deleteMe: defineEndpoint<void>({
    method: "DELETE",
    path: ROUTES.users.deleteMe,
    auth: true,
  }),

  deleteMyData: defineEndpoint<DeleteUserDataResponse, DeleteUserDataBody>({
    method: "DELETE",
    path: ROUTES.users.deleteMyData,
    auth: true,
  }),
} as const;

export type UsersModule = typeof usersModule;
