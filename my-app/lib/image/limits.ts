import { IMAGE_LIMITS } from "@/lib/constants";

type UploadKind = keyof typeof IMAGE_LIMITS;

export function getUploadLimits(kind: UploadKind) {
  return IMAGE_LIMITS[kind];
}
