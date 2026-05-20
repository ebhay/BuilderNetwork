import type { ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">{children}</div>
  );
}
