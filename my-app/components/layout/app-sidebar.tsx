"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  FileText,
  Hammer,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  SquareUserRound,
  User,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

type SidebarActive = "dashboard" | "ideas" | "manage-profile" | "my-profile";

type SidebarUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  username?: string | null;
  profileImageUrl?: string | null;
};

export function AppSidebar({
  active,
  user,
}: {
  active: SidebarActive;
  user?: SidebarUser | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const myProfileHref = user?.username ? `/u/${user.username}` : user?.id ? `/u/${user.id}` : "/onboarding?edit=1&next=%2Fdashboard";

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {user ? (
        <Link
          href="/dashboard?tab=ideas"
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
            active === "dashboard" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
      ) : null}
      <Link
        href="/ideas"
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
          active === "ideas" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
        }`}
      >
        <Lightbulb className="h-4 w-4" /> Explore Ideas
      </Link>
      {user ? (
        <>
          <Link
            href="/dashboard?tab=builds"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted"
          >
            <Hammer className="h-4 w-4" /> My Builds
          </Link>
          <Link
            href="/dashboard?tab=drafts"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted"
          >
            <FileText className="h-4 w-4" /> Drafts
          </Link>
          <Link
            href="/dashboard?tab=saved"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted"
          >
            <Bookmark className="h-4 w-4" /> Saved Ideas
          </Link>
          <div className="my-2 border-t border-border" />
        </>
      ) : null}
      <Link
        href={myProfileHref}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
          active === "my-profile" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
        }`}
      >
        <SquareUserRound className="h-4 w-4" /> My Profile
      </Link>
      <Link
        href="/onboarding?edit=1&next=%2Fdashboard"
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
          active === "manage-profile" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
        }`}
      >
        <User className="h-4 w-4" /> Manage Profile
      </Link>
    </nav>
  );

  const renderUserInfo = () => (
    <div className="mt-auto border-t border-border pt-3">
      {user ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-ink">
            {user.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt="Profile avatar"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              (user.name?.trim()?.slice(0, 1).toUpperCase() ?? user.email?.slice(0, 1).toUpperCase() ?? "U")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name?.trim() || "Builder"}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username || "username"}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Logout"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          onClick={() => setIsOpen(false)}
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          Log in to build
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Header (hidden on desktop) */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-ink">
          Builder Network
        </Link>

        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[10px] font-semibold text-ink">
          {user?.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : user ? (
            <Link href="/dashboard" className="flex h-full w-full items-center justify-center">
              {(user.name?.trim()?.slice(0, 1).toUpperCase() ?? "B")}
            </Link>
          ) : (
            <Link href="/login" className="flex h-full w-full items-center justify-center">
              🔑
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Sliding Navigation Drawer (hidden on desktop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="fixed inset-y-0 left-0 flex w-[260px] transform flex-col border-r border-border bg-card p-4 shadow-xl transition-transform duration-300 ease-in-out">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="font-heading text-lg font-semibold tracking-tight text-ink"
              >
                Builder Network
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNavLinks()}
            {renderUserInfo()}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-border bg-card/60 px-3 pb-3 pt-0 lg:flex lg:flex-col">
        <Link href="/" className="mb-2 px-2.5 py-3 font-heading text-xl font-semibold tracking-tight text-ink">
          Builder Network
        </Link>
        {renderNavLinks()}
        {renderUserInfo()}
      </aside>
    </>
  );
}
