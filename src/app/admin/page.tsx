import { adminServerPath } from "@/admin/lib/server-routing";
import { redirect } from "next/navigation";


export default async function AdminIndexPage() {
  redirect(await adminServerPath("/admin/dashboard"));
}
