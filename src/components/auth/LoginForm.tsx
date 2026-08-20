"use client";

import { FC, FormEvent, useState } from "react";
import { Button, Field, Input } from "@/components/common";
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

      <Field label="Username">
        <Input
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </Field>

      <Field label="Password">
        <Input
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={1}
        />
      </Field>

      {error && <p className="text-sm text-foreground">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </Button>

      <Button
        variant="ghost"
        onClick={() => {
          setMode(isRegister ? "login" : "register");
          setError("");
        }}
      >
        {isRegister ? "Already have an account? Sign in" : "Need an account?"}
      </Button>
    </form>
  );
};

export default LoginForm;
