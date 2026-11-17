import { headers } from "next/headers";
import { adminPath, isAdminHost } from "./routing";

export async function adminServerPath(path: string) {
  return adminPath(path, isAdminHost((await headers()).get("host") || ""));
}
