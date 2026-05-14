"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, User } from "lucide-react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1)
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { identifier: "", password: "" } });

  async function onSubmit(values: LoginValues) {
    setError(null);
    try {
      const response = await login(values);
      setSession(response.user, response.accessToken);
      const nextPath = searchParams.get("next");
      router.push(nextPath?.startsWith("/") ? (nextPath as Route) : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="grid gap-2 text-sm text-[var(--muted)]">
        Account
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-[var(--muted)]" size={16} />
          <Input className="pl-9" placeholder="email or username" {...form.register("identifier")} />
        </div>
      </label>
      <label className="grid gap-2 text-sm text-[var(--muted)]">
        Password
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-[var(--muted)]" size={16} />
          <Input className="pl-9" type="password" placeholder="password" {...form.register("password")} />
        </div>
      </label>
      {error ? <p className="text-sm text-[var(--crimson)]">{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <LogIn size={16} />
        Sign in
      </Button>
    </form>
  );
}
