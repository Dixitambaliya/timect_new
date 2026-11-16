"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Check,
  ExternalLink,
  HelpCircle,
  Loader2,
  MessageCircle,
  Save,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/admin/components/layout/Breadcrumbs";
import {
  adminGetWhatsAppSettings,
  adminSaveWhatsAppSettings,
} from "@/admin/actions/storefront";
import { useToast } from "@/admin/hooks/useToast";
import { WhatsApp } from "@/components/fuse/icons";
import {
  DEFAULT_STOREFRONT,
  buildWhatsAppLink,
  type WhatsAppButtonSettings,
} from "@/data/storefront";

const BUTTON_TEXT_PRESETS = [
  "Ask on WhatsApp",
  "Chat on WhatsApp",
  "Enquire on WhatsApp",
  "Order via WhatsApp",
  "Buy on WhatsApp",
];

const VARIABLE_TAGS = [
  { tag: "{name}", label: "Product name" },
  { tag: "{price}", label: "Price (e.g. ₹1,30,000)" },
  { tag: "{code}", label: "Product code (Ref. code)" },
  { tag: "{url}", label: "Product link (attaches preview image)" },
];

export default function WhatsAppAdminPage() {
  const { success, error } = useToast();
  const [data, setData] = useState<WhatsAppButtonSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    adminGetWhatsAppSettings()
      .then((settings) => {
        if (!cancelled) {
          setData(settings);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          error("Failed to load WhatsApp settings");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  const patch = (partial: Partial<WhatsAppButtonSettings>) => {
    setData((prev) => (prev ? { ...prev, ...partial } : { ...DEFAULT_STOREFRONT.whatsappButton!, ...partial }));
  };

  const handleSave = () => {
    if (!data) return;
    startTransition(async () => {
      const res = await adminSaveWhatsAppSettings(data);
      if (res.ok) {
        success("WhatsApp button settings saved");
      } else {
        error(res.error || "Save failed");
      }
    });
  };

  const insertTag = (tag: string) => {
    if (!data) return;
    patch({
      messageTemplate: (data.messageTemplate ? data.messageTemplate + " " : "") + tag,
    });
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
      </div>
    );
  }

  const sampleUrl = typeof window !== "undefined" ? `${window.location.origin}/product/anniversary` : "https://timect.com/product/anniversary";
  const previewLink = buildWhatsAppLink(
    data.phoneNumber,
    data.messageTemplate,
    {
      name: "Timect Anniversary Edition",
      price: "₹1,30,000",
      code: "T145-ANNIV",
      url: sampleUrl,
    },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Storefront", href: "/admin/storefront" },
          { label: "WhatsApp Button" },
        ]}
        title="WhatsApp Button Settings"
        description="Manage the 'Ask on WhatsApp' button text, phone number, enquiry message template, and concierge links."
        actions={
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status & General */}
          <div className="admin-card space-y-5 p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-[var(--admin-line)] pb-4">
              <div>
                <h2 className="text-[17px] font-bold">Button Status & Phone Number</h2>
                <p className="text-xs text-[var(--admin-muted)]">
                  Enable or disable the button and set the primary recipient number
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.enabled}
                  onChange={(e) => patch({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#128c7e]"
                />
                <span className="text-sm font-semibold">
                  {data.enabled ? "Enabled on storefront" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="admin-label" htmlFor="phoneNumber">
                  WhatsApp phone number
                </label>
                <div className="relative">
                  <input
                    id="phoneNumber"
                    className="admin-input font-mono"
                    placeholder="e.g. 919876543210 (digits with country code)"
                    value={data.phoneNumber}
                    onChange={(e) => patch({ phoneNumber: e.target.value })}
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-[var(--admin-muted)]">
                  Include international country code without spaces or symbols (e.g. <code>91</code> for India followed by 10-digit number).
                </p>
              </div>

              <div>
                <label className="admin-label" htmlFor="buttonText">
                  Button text / label
                </label>
                <input
                  id="buttonText"
                  className="admin-input font-medium"
                  placeholder="Ask on WhatsApp"
                  value={data.buttonText}
                  onChange={(e) => patch({ buttonText: e.target.value })}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs text-[var(--admin-muted)] self-center me-1">Quick presets:</span>
                  {BUTTON_TEXT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => patch({ buttonText: preset })}
                      className={`rounded-full px-2.5 py-1 text-xs transition ${
                        data.buttonText === preset
                          ? "bg-[var(--admin-accent)] text-white font-semibold"
                          : "bg-[var(--admin-bg)] text-[var(--admin-ink)] hover:bg-[var(--admin-accent-soft)]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Enquiry Message Template */}
          <div className="admin-card space-y-4 p-5 md:p-6">
            <div>
              <h2 className="text-[17px] font-bold">Product Enquiry Message Template</h2>
              <p className="text-xs text-[var(--admin-muted)]">
                The message automatically composed when a customer clicks the WhatsApp button on a product page or quick view modal.
              </p>
            </div>

            <div>
              <label className="admin-label" htmlFor="messageTemplate">
                Message template
              </label>
              <textarea
                id="messageTemplate"
                rows={4}
                className="admin-input resize-y font-sans leading-relaxed"
                placeholder="Hi Timect, I would like to enquire about {name} ({price}). {url}"
                value={data.messageTemplate}
                onChange={(e) => patch({ messageTemplate: e.target.value })}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--admin-muted)] mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Click to insert dynamic variables:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_TAGS.map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    title={label}
                    className="inline-flex items-center gap-1 rounded-fuse-sm border border-[var(--admin-line)] bg-[var(--admin-bg)] px-2.5 py-1 text-xs font-mono font-semibold transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)]"
                  >
                    <span>{tag}</span>
                    <span className="font-sans text-[11px] text-[var(--admin-muted)] font-normal">({label})</span>
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-[11.5px] text-[var(--admin-muted)]">
                💡 <span className="font-medium">Image preview:</span> WhatsApp automatically generates a rich preview card with the watch&apos;s photo from the product <code>{`{url}`}</code>. A separate raw image URL is not needed.
              </p>
            </div>
          </div>

          {/* Corporate Gifting & Concierge */}
          <div className="admin-card space-y-4 p-5 md:p-6">
            <div>
              <h2 className="text-[17px] font-bold">Corporate & General Concierge Messages</h2>
              <p className="text-xs text-[var(--admin-muted)]">
                Pre-filled messages used for corporate gifting requests and the top announcement/footer concierge links.
              </p>
            </div>

            <div>
              <label className="admin-label" htmlFor="corporateMessage">
                Corporate gifting enquiry message
              </label>
              <input
                id="corporateMessage"
                className="admin-input"
                placeholder="Hi Timect, I'd like help with a corporate gifting order."
                value={data.corporateMessage}
                onChange={(e) => patch({ corporateMessage: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-label" htmlFor="conciergeMessage">
                General concierge message (Announcement bar, drawer, footer)
              </label>
              <input
                id="conciergeMessage"
                className="admin-input"
                placeholder="Hi Timect, I have a question about your watches."
                value={data.conciergeMessage}
                onChange={(e) => patch({ conciergeMessage: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-6">
          <div className="admin-card sticky top-24 space-y-4 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--admin-muted)]">
              Storefront Live Preview
            </h3>

            <div className="rounded-fuse border border-[var(--admin-line)] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Timect</p>
              <h4 className="mt-1 text-base font-bold text-ink">Timect Anniversary Edition</h4>
              <p className="text-sm font-semibold text-ink mt-0.5">₹1,30,000</p>
              <p className="text-[11px] text-muted">Ref. T145-ANNIV</p>

              <div className="mt-4 space-y-2">
                {data.enabled ? (
                  <div className="flex items-center justify-center gap-2 rounded-fuse bg-whatsapp py-3 px-4 text-center font-semibold text-white shadow-sm transition hover:brightness-95">
                    <WhatsApp className="h-5 w-5" />
                    <span>{data.buttonText || "Ask on WhatsApp"}</span>
                  </div>
                ) : (
                  <div className="rounded-fuse border border-dashed border-red-300 bg-red-50 p-3 text-center text-xs text-red-600 font-medium">
                    Button is currently disabled on storefront
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 rounded-fuse border border-line bg-btn py-2.5 text-center text-xs font-semibold text-ink">
                  Enquire by email
                </div>
              </div>
            </div>

            <div className="rounded-fuse bg-[var(--admin-bg)] p-3 text-xs space-y-1.5">
              <p className="font-semibold text-[var(--admin-heading)]">Generated message preview:</p>
              <p className="font-mono text-[11px] text-[var(--admin-muted)] whitespace-pre-wrap break-words rounded bg-white p-2 border border-[var(--admin-line)]">
                {data.messageTemplate
                  .replace(/\{name\}/g, "Timect Anniversary Edition")
                  .replace(/\{product\}/g, "Timect Anniversary Edition")
                  .replace(/\{price\}/g, "₹1,30,000")
                  .replace(/\{code\}/g, "T145-ANNIV")
                  .replace(/\{url\}/g, sampleUrl)
                  .replace(/\s*\{image\}/g, "")
                  .replace(/\s*Image:\s*\{image\}/gi, "")
                  .trim()}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={previewLink}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-secondary w-full"
              >
                <ExternalLink className="h-4 w-4" />
                Test WhatsApp link
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
