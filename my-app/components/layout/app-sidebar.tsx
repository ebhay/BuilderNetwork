import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  FileText,
  Hammer,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Settings,
  SquareUserRound,
  User,
  Users,
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
  const myProfileHref = user?.username ? `/u/${user.username}` : user?.id ? `/u/${user.id}` : "/onboarding?edit=1&next=%2Fdashboard";

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-border bg-card/60 px-3 pb-3 pt-0 lg:flex lg:flex-col">
      <Link href="/" className="mb-2 px-2.5 py-2 font-heading text-xl font-semibold tracking-tight text-ink">
        Builder Network
      </Link>
      <nav className="space-y-1">
        <Link
          href="/dashboard?tab=ideas"
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
            active === "dashboard" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
        <Link
          href="/ideas"
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
            active === "ideas" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
          }`}
        >
          <Lightbulb className="h-4 w-4" /> Explore Ideas
        </Link>
        <Link href="/dashboard?tab=builds" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted">
          <Hammer className="h-4 w-4" /> My Builds
        </Link>
        <Link href="/dashboard?tab=requests" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted">
          <Users className="h-4 w-4" /> Join Requests
        </Link>
        <Link href="/dashboard?tab=drafts" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted">
          <FileText className="h-4 w-4" /> Drafts
        </Link>
        <Link href="/dashboard?tab=saved" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-muted">
          <Bookmark className="h-4 w-4" /> Saved Ideas
        </Link>
        <div className="my-2 border-t border-border" />
        <Link href="#" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink/70 hover:bg-muted">
          <Bell className="h-4 w-4" /> Notifications
        </Link>
        <Link
          href={myProfileHref}
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
            active === "my-profile" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
          }`}
        >
          <SquareUserRound className="h-4 w-4" /> My Profile
        </Link>
        <Link
          href="/onboarding?edit=1&next=%2Fdashboard"
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
            active === "manage-profile" ? "bg-accent font-medium text-primary" : "text-ink hover:bg-muted"
          }`}
        >
          <User className="h-4 w-4" /> Manage Profile
        </Link>
        <Link href="#" className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink/70 hover:bg-muted">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </nav>
      <div className="mt-auto border-t border-border pt-3">
        {user ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-ink">
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
              <button type="submit" aria-label="Logout" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-ink">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Log in to build
          </Link>
        )}
      </div>
    </aside>
  );
}
