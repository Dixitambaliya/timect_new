"use client";

import { Suspense, useCallback, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Archive, Download, ExternalLink, Inbox as InboxIcon, Loader2, Mail, MailOpen, Reply, Search, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/admin/components/layout/Breadcrumbs";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import EmptyState from "@/admin/components/ui/EmptyState";
import { useToast } from "@/admin/hooks/useToast";
import {
  adminDeleteMessages,
  adminDeleteSubscriber,
  adminListMessages,
  adminListSubscribers,
  adminSetMessageStatus,
  type ContactMessage,
  type MessageStatus,
  type Subscriber,
} from "@/admin/actions/inbox";

const STATUS_TABS: [MessageStatus | "all", string][] = [
  ["all", "Inbox"],
  ["new", "Unread"],
  ["read", "Read"],
  ["archived", "Archived"],
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Messages() {
  const params = useSearchParams();
  const { success, error } = useToast();
  const [status, setStatus] = useState<MessageStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof adminListMessages>> | null>(null);
  const [openId, setOpenId] = useState<number | null>(() => Number(params.get("open")) || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setData(await adminListMessages({ status, search, pageSize: 100 }));
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const open = data?.items.find((m) => m.id === openId) || null;

  // Opening an unread message marks it read
  useEffect(() => {
    if (open && open.status === "new") {
      void adminSetMessageStatus([open.id], "read").then(() => load());
    }
  }, [open, load]);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) success(msg);
      else error(res.error || "Something went wrong");
      await load();
    });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map(([id, label]) => (
          <button key={id} type="button" className={`admin-pill ${status === id ? "is-active" : ""}`} onClick={() => setStatus(id)}>
            {label}
            {data && <span className="text-[12px] font-normal text-[var(--admin-muted)]">{data.counts[id]}</span>}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input className="admin-input !pl-10" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="admin-card overflow-hidden">
          {!data ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-muted)]" />
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState icon={<InboxIcon className="h-5 w-5" />} title="No messages" description="Contact form submissions from the storefront appear here." />
          ) : (
            <ul className="admin-scrollbar max-h-[70vh] divide-y divide-[var(--admin-line)] overflow-y-auto">
              {data.items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(m.id)}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${
                      openId === m.id ? "bg-[var(--admin-accent-soft)]" : "hover:bg-[var(--admin-surface-2)]"
                    }`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.status === "new" ? "bg-[var(--admin-warning)]" : "bg-transparent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-[14px] ${m.status === "new" ? "font-bold" : "font-semibold"}`}>{m.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--admin-muted)]">{formatDate(m.createdAt).split(",")[0]}</span>
                      </span>
                      <span className="block truncate text-[13px] text-[var(--admin-ink)]">{m.subject || "(no subject)"}</span>
                      <span className="block truncate text-[12px] text-[var(--admin-muted)]">{m.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card min-h-[420px] p-5 md:p-8">
          {!open ? (
            <EmptyState icon={<Mail className="h-5 w-5" />} title="Select a message" description="Choose a message from the list to read it." />
          ) : (
            <MessageDetail
              message={open}
              pending={pending}
              onStatus={(s) => act(() => adminSetMessageStatus([open.id], s), s === "archived" ? "Archived" : "Updated")}
              onDelete={() => setConfirmDelete(true)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this message?"
        description="This permanently removes the message. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!open) return;
          act(() => adminDeleteMessages([open.id]), "Message deleted");
          setConfirmDelete(false);
          setOpenId(null);
        }}
      />
    </>
  );
}

function MessageDetail({
  message: m,
  pending,
  onStatus,
  onDelete,
}: {
  message: ContactMessage;
  pending: boolean;
  onStatus: (s: MessageStatus) => void;
  onDelete: () => void;
}) {
  const replyHref = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your Timect enquiry"}`)}`;
  return (
    <div className="animate-rise-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold">{m.subject || "(no subject)"}</h2>
          <p className="mt-1 text-[13px] text-[var(--admin-muted)]">{formatDate(m.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={replyHref} className="admin-btn admin-btn-primary">
            <Reply className="h-4 w-4" /> Reply
          </a>
          {m.status === "archived" ? (
            <button type="button" className="admin-btn admin-btn-secondary" disabled={pending} onClick={() => onStatus("read")}>
              <InboxIcon className="h-4 w-4" /> Restore
            </button>
          ) : (
            <>
              <button type="button" className="admin-btn admin-btn-secondary" disabled={pending} onClick={() => onStatus("new")} title="Mark unread">
                <MailOpen className="h-4 w-4" />
              </button>
              <button type="button" className="admin-btn admin-btn-secondary" disabled={pending} onClick={() => onStatus("archived")}>
                <Archive className="h-4 w-4" /> Archive
              </button>
            </>
          )}
          <button type="button" className="admin-btn admin-btn-danger !px-3" disabled={pending} onClick={onDelete} aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 rounded-fuse-md bg-[var(--admin-bg)] p-4 sm:grid-cols-3">
        <div>
          <dt className="text-[12px] text-[var(--admin-muted)]">From</dt>
          <dd className="font-semibold">{m.name}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--admin-muted)]">Email</dt>
          <dd className="break-all font-semibold">
            <a href={`mailto:${m.email}`} className="link-hover">
              {m.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--admin-muted)]">Phone</dt>
          <dd className="font-semibold">{m.phone ? <a href={`tel:${m.phone}`}>{m.phone}</a> : "—"}</dd>
        </div>
      </dl>

      {m.productSlug && (
        <a
          href={`/product/${m.productSlug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-fuse-md border border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)] px-3 py-2 text-[13px] font-semibold"
        >
          Product: {m.productSlug} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed">{m.message}</p>
    </div>
  );
}

function Subscribers() {
  const { success, error } = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Subscriber[] | null>(null);
  const [toDelete, setToDelete] = useState<Subscriber | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => setItems(await adminListSubscribers(search)), [search]);
  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const exportCsv = () => {
    if (!items?.length) return;
    const csv = ["email,subscribed_at", ...items.map((s) => `${s.email},${new Date(s.createdAt).toISOString()}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `timect-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-card">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input className="admin-input !pl-10" placeholder="Search emails…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-[13px] text-[var(--admin-muted)]">{items ? `${items.length} subscribers` : ""}</span>
        <button type="button" className="admin-btn admin-btn-secondary ml-auto" onClick={exportCsv} disabled={!items?.length}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>
      {!items ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-muted)]" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No subscribers yet" description="Newsletter sign-ups from the storefront footer appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscribed</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.email}</td>
                  <td className="text-[var(--admin-muted)]">{formatDate(s.createdAt)}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost !px-2" aria-label={`Remove ${s.email}`} onClick={() => setToDelete(s)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!toDelete}
        title="Remove subscriber?"
        description={toDelete ? `${toDelete.email} will no longer receive newsletters.` : undefined}
        confirmLabel="Remove"
        danger
        loading={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          startTransition(async () => {
            if (!toDelete) return;
            const res = await adminDeleteSubscriber(toDelete.id);
            if (res.ok) success("Subscriber removed");
            else error(res.error);
            setToDelete(null);
            await load();
          })
        }
      />
    </div>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Inbox" }]}
        title="Inbox"
        description="Contact form enquiries and newsletter subscribers from the storefront"
        actions={
          <div className="flex gap-2">
            <button type="button" className={`admin-pill ${tab === "messages" ? "is-active" : ""}`} onClick={() => setTab("messages")}>
              <Mail className="h-4 w-4" /> Messages
            </button>
            <button type="button" className={`admin-pill ${tab === "subscribers" ? "is-active" : ""}`} onClick={() => setTab("subscribers")}>
              <Users className="h-4 w-4" /> Subscribers
            </button>
          </div>
        }
      />
      <Suspense fallback={null}>{tab === "messages" ? <Messages /> : <Subscribers />}</Suspense>
    </div>
  );
}
