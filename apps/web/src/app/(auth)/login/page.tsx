import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { Card, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <div className="text-xs uppercase text-[var(--gold)]">MMORPG Network</div>
          <CardTitle className="mt-2 text-2xl">Sign in to command center</CardTitle>
          <p className="mt-2 text-sm text-[var(--muted)]">Use your web or launcher account.</p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-[#0a0e13]" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-sm text-[var(--muted)]">
          New player?{" "}
          <Link className="text-[var(--teal)]" href="/register">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
