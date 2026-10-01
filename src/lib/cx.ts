/** Join truthy class names (shared by server and client components). */
export function cx(...classes: (string | false | null | undefined | 0)[]): string {
  return classes.filter(Boolean).join(" ");
}
