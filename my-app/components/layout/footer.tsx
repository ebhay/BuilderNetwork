import Link from "next/link";
import { Lightbulb } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Builder Network
          </p>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/ideas" className="text-muted-foreground hover:text-foreground">
            Ideas
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}