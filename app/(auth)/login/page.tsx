"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(fd: FormData) {
    setPending(true);
    setError(null);
    const res = await loginAction({
      email: (fd.get("email") as string) ?? "",
      password: (fd.get("password") as string) ?? "",
    });
    if (res && "error" in res) {
      setError(res.error as string);
      setPending(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <p className="microlabel">{"// "}SIGN IN</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em]">
        INTELLG<span className="text-accent">NCE</span>
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Your data stays on your machine. This is a personal ledger, not a service.
      </p>

      <form action={submit} className="mt-8 flex flex-col gap-4">
        <label className="microlabel flex flex-col gap-1.5">
          EMAIL
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="microlabel flex flex-col gap-1.5">
          PASSWORD
          <input className="field" name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && (
          <p className="border border-accent/40 bg-paper2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-accent">
            {error}
          </p>
        )}
        <button className="btn btn-accent mt-2" type="submit" disabled={pending}>
          {pending ? "SIGNING IN…" : "SIGN IN →"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        No account yet?{" "}
        <Link className="text-accent underline underline-offset-2 hover:text-ink" href="/signup">
          Create one
        </Link>
        .
      </p>
    </div>
  );
}