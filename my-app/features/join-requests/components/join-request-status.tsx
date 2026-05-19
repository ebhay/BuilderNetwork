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
        ? "Request Pending"
        : state === "MEMBER"
          ? "Already Teammate"
          : "Lead Builder";
  return (
    <Badge variant="outline" className="rounded-md">
      {label}
    </Badge>
  );
}
