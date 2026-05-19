export function isOwner(actorId: string, resourceOwnerId: string) {
  return actorId === resourceOwnerId;
}
