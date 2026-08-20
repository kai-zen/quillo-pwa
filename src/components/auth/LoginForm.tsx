"use client";

import { FC, FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useAuth } from "./AuthProvider";

const LoginForm: FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isRegister = mode === "register";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const body = { username: username.trim(), password };
      if (isRegister) await register(body);
      else await login(body);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          isRegister ? "Could not create account." : "Could not sign in.",
        ),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isRegister ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isRegister
            ? "Pick a username and password to start."
            : "Use your Quillo account to continue."}
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Username</span>
        <input
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={1}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      {error && <p className="text-sm text-foreground">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-lg bg-foreground px-3 py-2 text-sm text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(isRegister ? "login" : "register");
          setError("");
        }}
        className="cursor-pointer rounded-lg text-sm text-muted transition-colors hover:text-foreground"
      >
        {isRegister ? "Already have an account? Sign in" : "Need an account?"}
      </button>
    </form>
  );
};

export default LoginForm;
