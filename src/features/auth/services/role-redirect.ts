export function roleRedirectPath(role: string): string {
  return role === "admin" || role === "manager" ? "/admin" : "/";
}
