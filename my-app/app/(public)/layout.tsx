import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { logoutAction } from "@/features/auth/actions";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const avatarLabel = profile?.name?.trim()?.slice(0, 1).toUpperCase() ?? user?.email?.slice(0, 1).toUpperCase() ?? "U";
  const avatarUrl = profile?.profile_image_url ?? null;
  const profileSlug = profile?.username || user?.id;

  return (
    <div className="min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50">
        <header className="flex w-full items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur-sm md:px-16">
          <p className="font-heading text-xl font-semibold tracking-tight text-ink">Builder Network</p>
          <div className="flex items-center gap-3">
            <Link href="/ideas" className={buttonVariants({ variant: "ghost" })}>
              Explore ideas
            </Link>
            {user ? (
              <details className="relative">
                <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-border bg-card text-sm font-semibold text-ink">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Profile avatar" width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    avatarLabel
                  )}
                </summary>
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-card p-2 shadow-sm">
                  <Link href={`/u/${profileSlug}`} className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-muted">
                    Manage profile
                  </Link>
                  <Link href="/dashboard" className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-muted">
                    Dashboard
                  </Link>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-muted">
                      Logout
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "default" })}>
                Log in
              </Link>
            )}
          </div>
        </header>
      </div>
      <div className="pt-18">{children}</div>
    </div>
  );
}
