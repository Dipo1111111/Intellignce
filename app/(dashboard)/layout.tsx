import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NavRail } from "@/components/nav-rail";

async function signOutServerAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
      <div className="hrule mb-6 flex flex-col gap-6 pb-6 md:mb-10 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <Link className="text-lg font-bold tracking-tight" href="/">
            INTELLG<span className="text-accent">NCE</span>
          </Link>
          <span className="chip hidden sm:inline-flex">
            <b className="text-ink">A PROGRAM OF RECORD</b>· 08 WKS
          </span>
        </div>
        <NavRail />
      </div>

      <main>{children}</main>

      <footer className="hrule mt-14 flex flex-col gap-2 pt-5 md:flex-row md:items-center md:justify-between">
        <span className="microlabel">
          INTELLGNCE — A PROGRAM OF RECORD · <b className="text-accent">SCIENTIFIC STALWARTS.</b>
        </span>
        <span className="flex items-center gap-4">
          <span className="microlabel">© 2026 · LOCAL-FIRST</span>
          <form action={signOutServerAction}>
            <button className="microlabel text-accent underline underline-offset-2 hover:text-ink" type="submit">
              SIGN OUT
            </button>
          </form>
        </span>
      </footer>
    </div>
  );
}