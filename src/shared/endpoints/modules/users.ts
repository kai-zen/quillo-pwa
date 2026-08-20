import { ROUTES } from "../routes";
import type { EndpointDef } from "../types";
import type {
  AuthResponse,
  ChangePasswordBody,
  LoginBody,
  RegisterBody,
  User,
} from "@/shared/types";

export const usersModule = {
  register: {
    method: "POST",
    path: ROUTES.users.register,
    auth: false,
  } satisfies EndpointDef<AuthResponse, RegisterBody>,

  login: {
    method: "POST",
    path: ROUTES.users.login,
    auth: false,
  } satisfies EndpointDef<AuthResponse, LoginBody>,

  getMe: {
    method: "GET",
    path: ROUTES.users.me,
    auth: true,
  } satisfies EndpointDef<User>,

  changePassword: {
    method: "PATCH",
    path: ROUTES.users.changePassword,
    auth: true,
  } satisfies EndpointDef<void, ChangePasswordBody>,

  deleteMe: {
    method: "DELETE",
    path: ROUTES.users.deleteMe,
    auth: true,
  } satisfies EndpointDef<void>,
} as const;

export type UsersModule = typeof usersModule;
