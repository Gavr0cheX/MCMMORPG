"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(40).optional().or(z.literal("")),
  password: z.string().min(12)
});

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", username: "", displayName: "", password: "" }
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);
    try {
      const response = await register({
        email: values.email,
        username: values.username,
        password: values.password,
        ...(values.displayName ? { displayName: values.displayName } : {})
      });
      setSession(response.user, response.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Input placeholder="email" {...form.register("email")} />
      <Input placeholder="username" {...form.register("username")} />
      <Input placeholder="display name" {...form.register("displayName")} />
      <Input type="password" placeholder="password, 12+ chars" {...form.register("password")} />
      {error ? <p className="text-sm text-[var(--crimson)]">{error}</p> : null}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <UserPlus size={16} />
        Create account
      </Button>
    </form>
  );
}
