import { redirect } from "next/navigation";
import { getAdminSession } from "@/admin/lib/session";
import { adminUnreadMessageCount } from "@/admin/actions/inbox";
import ProtectedShell from "./ProtectedShell";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const unread = await adminUnreadMessageCount();

  return (
    <ProtectedShell user={session} unread={unread}>
      {children}
    </ProtectedShell>
  );
}
