"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-ink">
            Builder Network
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/ideas"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Explore Ideas
          </Link>
          <Link
            href="/ideas/submit"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Submit an Idea
          </Link>
          <a
            href="#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            FAQ
          </a>
        </nav>

        {/* Right: Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/ideas/submit"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary hover:bg-primary/95 text-white font-medium rounded-md px-4 shadow-sm",
            })}
          >
            Start Building
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink md:hidden hover:bg-muted"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="border-b border-border bg-background px-6 py-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/ideas"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink py-1"
            >
              Explore Ideas
            </Link>
            <Link
              href="/ideas/submit"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink py-1"
            >
              Submit an Idea
            </Link>
            <a
              href="#faq"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink py-1"
            >
              FAQ
            </a>
            <hr className="border-border my-1" />
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex h-9 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/ideas/submit"
                onClick={() => setIsOpen(false)}
                className={buttonVariants({
                  variant: "default",
                  size: "default",
                  className: "w-full bg-primary hover:bg-primary/95 text-white font-medium rounded-md shadow-sm",
                })}
              >
                Start Building
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
