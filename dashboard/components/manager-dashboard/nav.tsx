"use client";

import { ArrowLeft, BedDouble, Building2, Inbox, QrCode } from "lucide-react";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

export type View = "home" | "inbox" | "rooms" | "share";

/** The navigation's level — decides what the sidebar/bottom bar offer:
 *  - hub:    a multi-branch hostel at the Branches home (no branch entered)
 *  - branch: inside one branch's workspace (back link + branch sub-header)
 *  - unit:   a single-site hostel (no branches level at all)
 */
export type NavMode =
  | { kind: "hub" }
  | { kind: "branch"; name: string }
  | { kind: "unit" };

function DesktopNavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Inbox;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
      {badge !== undefined && badge > 0 ? (
        <span className="ml-auto rounded-full bg-brass-bright px-1.5 py-0.5 text-[10px] font-semibold text-wine-deep">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function MobileNavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Inbox;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        <Icon className="size-5" />
        {badge !== undefined && badge > 0 ? (
          <span className="absolute -right-1.5 -top-1 size-2.5 rounded-full bg-brass" />
        ) : null}
      </span>
      {label}
    </button>
  );
}

/**
 * Navigation, two levels (FR-B6a): the Branches hub is home for a
 * multi-branch hostel; entering a branch nests — the sidebar gains a back
 * link and the branch's name above its Enquiries / Rooms / Share items.
 * Mobile-first: the bottom bar leads with "Branches" as the back item,
 * one thumb tap from anywhere inside a branch.
 */
export function ManagerNav({
  mode,
  view,
  onViewChange,
  onBackToBranches,
  hostelName,
  newCount,
}: {
  mode: NavMode;
  view: View;
  onViewChange: (view: View) => void;
  /** Multi-branch only: leave the branch, back to the hub. */
  onBackToBranches?: () => void;
  hostelName: string;
  newCount: number;
}) {
  const inBranch = mode.kind === "branch";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card lg:flex">
        <div className="px-5 pb-6 pt-7">
          <p className="font-serif text-2xl font-semibold leading-tight tracking-tight">{hostelName}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{content.brand.productLabel}</p>
        </div>

        {inBranch ? (
          <div className="pb-4">
            <button
              type="button"
              onClick={onBackToBranches}
              className="mx-3 flex min-h-10 w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              {content.nav.backToBranches}
            </button>
            <p className="mt-4 px-5 font-serif text-lg font-semibold tracking-tight">{mode.name}</p>
          </div>
        ) : null}

        <nav className="flex-1 space-y-1 px-3">
          {mode.kind === "hub" ? (
            <>
              <DesktopNavItem
                icon={Building2}
                label={content.nav.branches}
                active={view === "home"}
                badge={newCount}
                onClick={() => onViewChange("home")}
              />
              <DesktopNavItem
                icon={QrCode}
                label={content.nav.share}
                active={view === "share"}
                onClick={() => onViewChange("share")}
              />
            </>
          ) : (
            <>
              <DesktopNavItem
                icon={Inbox}
                label={content.nav.inbox}
                active={view === "inbox"}
                badge={newCount}
                onClick={() => onViewChange("inbox")}
              />
              <DesktopNavItem
                icon={BedDouble}
                label={content.nav.rooms}
                active={view === "rooms"}
                onClick={() => onViewChange("rooms")}
              />
              <DesktopNavItem
                icon={QrCode}
                label={content.nav.share}
                active={view === "share"}
                onClick={() => onViewChange("share")}
              />
            </>
          )}
        </nav>
        <p className="px-5 pb-6 text-[11px] text-muted-foreground">{content.brand.managedBy}</p>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur lg:hidden"
        aria-label="Main navigation"
      >
        {mode.kind === "hub" ? (
          <div className="grid grid-cols-2 pb-[env(safe-area-inset-bottom)]">
            <MobileNavItem
              icon={Building2}
              label={content.nav.branches}
              active={view === "home"}
              badge={newCount}
              onClick={() => onViewChange("home")}
            />
            <MobileNavItem
              icon={QrCode}
              label={content.nav.share}
              active={view === "share"}
              onClick={() => onViewChange("share")}
            />
          </div>
        ) : (
          <div
            className={cn(
              "grid pb-[env(safe-area-inset-bottom)]",
              inBranch ? "grid-cols-4" : "grid-cols-3",
            )}
          >
            {inBranch ? (
              <MobileNavItem
                icon={Building2}
                label={content.nav.branches}
                onClick={() => onBackToBranches?.()}
              />
            ) : null}
            <MobileNavItem
              icon={Inbox}
              label={content.nav.inbox}
              active={view === "inbox"}
              badge={newCount}
              onClick={() => onViewChange("inbox")}
            />
            <MobileNavItem
              icon={BedDouble}
              label={content.nav.rooms}
              active={view === "rooms"}
              onClick={() => onViewChange("rooms")}
            />
            <MobileNavItem
              icon={QrCode}
              label={content.nav.share}
              active={view === "share"}
              onClick={() => onViewChange("share")}
            />
          </div>
        )}
      </nav>
    </>
  );
}

export function MobileTopBar({ hostelName, branchName }: { hostelName: string; branchName?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur lg:hidden">
      <div className="flex items-baseline gap-2 px-4 py-3">
        <p className="font-serif text-lg font-semibold tracking-tight">{hostelName}</p>
        {branchName ? (
          <span className="truncate text-[11px] font-medium text-muted-foreground">· {branchName}</span>
        ) : null}
        <p className="ml-auto text-[11px] font-medium text-muted-foreground">{content.brand.productLabel}</p>
      </div>
    </header>
  );
}
