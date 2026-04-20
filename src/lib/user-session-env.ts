export function getUserSessionSecret(): string {
  return process.env.USER_SESSION_SECRET ?? "";
}

export function hasUserSessionConfig(): boolean {
  return Boolean(getUserSessionSecret());
}
