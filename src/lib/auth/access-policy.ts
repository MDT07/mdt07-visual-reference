export interface OwnerIdentity {
  githubId?: string | null;
  role?: string | null;
}

export function matchesOwnerAccess(
  identity: OwnerIdentity | null | undefined,
  options: { isAdmin: boolean; ownerGithubId: string }
): boolean {
  return Boolean(
    options.isAdmin &&
      options.ownerGithubId &&
      identity?.role === "OWNER" &&
      identity.githubId === options.ownerGithubId
  );
}
