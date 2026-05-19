import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="mt-16 rounded-lg border border-border bg-brand-navy p-8 text-center md:p-12">
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-on-dark sm:text-4xl">
        Ready to ship your next project?
      </h2>
      <p className="mt-4 text-lg text-on-dark-muted max-w-xl mx-auto">
        Join thousands of builders who are turning ideas into real products. Start discovering, building, and showcasing today.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/login" className={buttonVariants({ variant: "default", size: "lg" })}>
          Get started free
        </Link>
        <Link
          href="/ideas"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "border-on-dark bg-on-dark text-ink hover:bg-on-dark/90",
          })}
        >
          Explore ideas
        </Link>
      </div>
    </section>
  );
}