export interface OwnerIdentity {
  githubId?: string | null;
  role?: string | null;
}

export function matchesOwnerAccess(
  identity: OwnerIdentity | null | undefined,
  options: { isStudio: boolean; ownerGithubId: string }
): boolean {
  return Boolean(
    options.isStudio &&
      options.ownerGithubId &&
      identity?.role === "OWNER" &&
      identity.githubId === options.ownerGithubId
  );
}
