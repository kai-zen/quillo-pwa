"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  getAuthToken,
  request,
  setAuthToken,
  subscribeAuth,
  usersModule,
} from "@/shared/endpoints";
import { queryKeys } from "@/shared/hooks/keys";
import type {
  AuthResponse,
  LoginBody,
  RegisterBody,
  User,
} from "@/shared/types";

const subscribeHydration = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;
const getServerToken = () => null;

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

const AuthProvider: FC<Props> = ({ children }) => {
  const queryClient = useQueryClient();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrated,
    getServerHydrated,
  );
  const token = useSyncExternalStore(
    subscribeAuth,
    getAuthToken,
    getServerToken,
  );

  const meQuery = useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => request(usersModule.getMe),
    enabled: hydrated && !!token,
    retry: false,
  });

  useEffect(() => {
    if (!hydrated || token) return;
    queryClient.clear();
  }, [hydrated, queryClient, token]);

  const applySession = (auth: AuthResponse) => {
    setAuthToken(auth.token);
    queryClient.setQueryData(queryKeys.users.me, auth.user);
  };

  const login = async (body: LoginBody) => {
    applySession(await request(usersModule.login, { body }));
  };

  const register = async (body: RegisterBody) => {
    applySession(await request(usersModule.register, { body }));
  };

  const logout = () => {
    setAuthToken(null);
    queryClient.clear();
  };

  const user = token ? (meQuery.data ?? null) : null;
  const isAuthenticated = hydrated && !!token;
  const isLoading = !hydrated;

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
