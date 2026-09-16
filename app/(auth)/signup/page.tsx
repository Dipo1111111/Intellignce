"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [timezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  );

  async function submit(fd: FormData) {
    setPending(true);
    setError(null);
    const res = await registerAction({
      email: (fd.get("email") as string) ?? "",
      password: (fd.get("password") as string) ?? "",
      timezone,
    });
    if (res && "error" in res) {
      setError(res.error as string);
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <p className="microlabel">{"// "}CREATE ACCOUNT</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em]">
        INTELLG<span className="text-accent">NCE</span>
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        One account, local-first. Password is hashed; nothing is shared anywhere.
      </p>

      <form action={submit} className="mt-8 flex flex-col gap-4">
        <label className="microlabel flex flex-col gap-1.5">
          EMAIL
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="microlabel flex flex-col gap-1.5">
          PASSWORD (MIN 8 CHARS)
          <input className="field" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        {error && (
          <p className="border border-accent/40 bg-paper2 px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-accent">
            {error}
          </p>
        )}
        <button className="btn btn-accent mt-2" type="submit" disabled={pending}>
          {pending ? "CREATING…" : "CREATE ACCOUNT →"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have one?{" "}
        <Link className="text-accent underline underline-offset-2 hover:text-ink" href="/login">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}