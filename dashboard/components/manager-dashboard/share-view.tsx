"use client";

import { QrCode, Download, Copy, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { slugify } from "@/lib/utils";
import type { ManagerBranch } from "./types";

/**
 * Share view (FR-B7): the manager's or caretaker's one-stop outreach asset
 * — the site link, a copy button, and a downloadable QR code for flyers,
 * gates and WhatsApp status. When the dashboard is scoped to one branch
 * (caretaker deployment or the switcher), the link and QR point at that
 * branch's public page (/b/[slug]); otherwise the hostel's root URL.
 * Generated in the browser from NEXT_PUBLIC_SITE_URL — no server needed.
 */

/**
 * Temporary base domain (the Franco Hostel landing page) used until each
 * hostel gets its own NEXT_PUBLIC_SITE_URL. Managers still see the
 * "hasn't been set up yet" notice so they know to ask for their own address.
 */
const FALLBACK_SITE_URL = "https://franco-hostel.vercel.app";

export function ShareView({ branch }: { branch?: ManagerBranch }) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = configuredSiteUrl || FALLBACK_SITE_URL;
  const targetUrl = siteUrl && branch ? `${siteUrl}/b/${slugify(branch.name)}` : siteUrl;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUrl) return;
    let cancelled = false;
    void QRCode.toDataURL(targetUrl, {
      width: 640,
      margin: 2,
      color: { dark: "#1c241eff", light: "#faf6efff" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  if (!targetUrl) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{content.share.notConfigured}</p>
      </div>
    );
  }

  async function copyLink() {
    const url = targetUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(content.share.copied);
    } catch {
      toast.error(content.toasts.saveFailed);
    }
  }

  return (
    <div className="space-y-6">
      {!configuredSiteUrl && (
        <div className="rounded-xl border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">{content.share.notConfigured}</p>
        </div>
      )}
      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-[13px] font-medium text-muted-foreground">
          {branch ? `${branch.name} — on your website` : "Your website"}
        </p>
        <p className="mt-2 break-all font-mono text-[15px] font-semibold text-foreground">{targetUrl}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void copyLink()}>
            <Copy /> {content.share.copyLink}
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> {content.share.openSite}
            </a>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <QrCode className="size-4" /> {content.share.downloadQr}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {content.share.qrHint}
            </p>
          </div>
        </div>
        {qrDataUrl ? (
          <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR code for ${targetUrl}`}
              className="size-40 rounded-lg border"
            />
            <a href={qrDataUrl} download={`${branch ? slugify(branch.name) : "hostel"}-qr.png`}>
              <Button type="button" size="sm">
                <Download /> {content.share.downloadQr}
              </Button>
            </a>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">…</p>
        )}
      </div>
    </div>
  );
}
