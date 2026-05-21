import { Badge } from "@/components/ui/badge";

export function JoinRequestStatus({
  state,
}: {
  state: "NONE" | "LOGIN_REQUIRED" | "PENDING" | "MEMBER" | "LEAD";
}) {
  if (state === "NONE") return null;
  const label =
    state === "LOGIN_REQUIRED"
      ? "Login required"
      : state === "PENDING"
        ? "Request pending"
        : state === "MEMBER"
          ? "Already a teammate"
          : "You lead this build";
  return (
    <Badge variant="outline" className="rounded-md">
      {label}
    </Badge>
  );
}
