import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";
import { Card, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <div className="text-xs uppercase text-[var(--gold)]">MMORPG Network</div>
          <CardTitle className="mt-2 text-2xl">Create your account</CardTitle>
          <p className="mt-2 text-sm text-[var(--muted)]">Your account powers the launcher, website, and game network.</p>
        </div>
        <RegisterForm />
        <p className="mt-5 text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link className="text-[var(--teal)]" href="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
