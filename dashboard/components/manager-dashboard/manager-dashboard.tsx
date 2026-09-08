"use client";

import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
// Cached queries (convex-helpers): the manager.get subscription survives
// unmounts for a short expiration window, so moving between the Branches
// hub and a branch's views is instant instead of re-fetching. Next.js
// apps import the deep paths (CONVEX_HELPERS.md › Query Caching).
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { content } from "@/lib/content";
import { branchLock } from "@/lib/utils";
import { BranchesView } from "./branches-view";
import { InquiryList } from "./inquiry-list";
import { ManagerNav, MobileTopBar, type NavMode, type View } from "./nav";
import { RoomsView } from "./rooms-view";
import { ShareView } from "./share-view";
import { StatsStrip } from "./stats-strip";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

type BranchId = Id<"branches">;

function ManagerDataView({
  hostelId,
  data,
  selectedBranch,
  onSelectBranch,
}: {
  hostelId: Id<"hostels">;
  data: NonNullable<ReturnType<typeof useQuery<typeof api.manager.get>>>;
  /** Multi-branch owner only: null = at the Branches hub (home). */
  selectedBranch: BranchId | null;
  onSelectBranch: (branchId: BranchId | null) => void;
}) {
  const ensureSetup = useMutation(api.manager.ensureSetup);
  const [view, setView] = useState<View>("home");

  // Unit hostels keep one implicit branch so rooms always have a home.
  const mode = data?.hostel.mode;
  const branchCount = data?.branches.length ?? 0;
  useEffect(() => {
    if (mode === "unit" && branchCount === 0) {
      void ensureSetup({ hostelId }).catch(() => undefined);
    }
  }, [mode, branchCount, ensureSetup, hostelId]);

  if (data === undefined || data === null) {
    return <LoadingState />;
  }

  const locked = Boolean(branchLock());
  const isMulti = data.hostel.mode === "multi";
  // Hub-first (FR-B6a): a multi-branch hostel opens at the Branches hub —
  // no aggregated all-branches view exists. Caretaker deployments are
  // locked into their branch and never see the hub.
  const atHub = isMulti && !locked && !selectedBranch;

  const navMode: NavMode = atHub
    ? { kind: "hub" }
    : isMulti
      ? { kind: "branch", name: data.branches[0]?.name ?? "" }
      : { kind: "unit" };

  // "home" only means something at the hub; inside a branch (or a unit
  // hostel) it resolves to the inbox.
  const effectiveView: View = atHub
    ? view === "share"
      ? "share"
      : "home"
    : view === "home"
      ? "inbox"
      : view;

  const newCount = data.inquiries.filter((inquiry) => inquiry.status === "new").length;
  const openRooms = data.rooms.reduce((sum, room) => sum + (room.accepting ? room.availableCount : 0), 0);

  // The query is scoped inside a branch (and always on caretaker locks);
  // unscoped at the hub so the branch cards carry live hostel-wide stats.
  const scopeBranchId = (branchLock() as BranchId | undefined) ?? selectedBranch;
  const queryArgs = scopeBranchId ? { hostelId, branchId: scopeBranchId } : { hostelId };
  // Share points at the branch's public page inside a branch workspace;
  // the hostel root everywhere else.
  const focusedBranch = !atHub && isMulti ? data.branches[0] : undefined;

  const heading =
    effectiveView === "inbox"
      ? content.inbox.heading
      : effectiveView === "rooms"
        ? content.rooms.heading
        : effectiveView === "share"
          ? content.share.heading
          : content.branchesView.heading;
  const description =
    effectiveView === "inbox"
      ? content.inbox.description
      : effectiveView === "rooms"
        ? isMulti
          ? content.rooms.descriptionMulti
          : content.rooms.descriptionUnit
        : effectiveView === "share"
          ? content.share.description
          : content.branchesView.description;

  return (
    <div className="min-h-dvh bg-background">
      <ManagerNav
        mode={navMode}
        view={effectiveView}
        onViewChange={setView}
        onBackToBranches={() => {
          onSelectBranch(null);
          setView("home");
        }}
        hostelName={data.hostel.name}
        newCount={newCount}
      />
      <div className="lg:pl-60">
        <MobileTopBar
          hostelName={data.hostel.name}
          branchName={navMode.kind === "branch" ? navMode.name : undefined}
        />
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-12">
          {/* Branch context eyebrow — inside a branch (or a caretaker lock) */}
          {navMode.kind === "branch" ? (
            <p className="mb-4 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {navMode.name}
              {locked ? ` · ${content.branchScope.caretakerFor}` : ""}
            </p>
          ) : null}

          <header className="mb-6">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>
          </header>

          <StatsStrip newCount={newCount} openRooms={openRooms} />

          <div className="mt-8">
            {atHub ? (
              effectiveView === "share" ? (
                <ShareView />
              ) : (
                <BranchesView
                  hostelId={hostelId}
                  data={data}
                  onSelect={(branchId) => {
                    onSelectBranch(branchId);
                    setView("inbox");
                  }}
                />
              )
            ) : effectiveView === "inbox" ? (
              <InquiryList
                queryArgs={queryArgs}
                inquiries={data.inquiries}
                hostelName={data.hostel.name}
              />
            ) : effectiveView === "rooms" ? (
              <RoomsView hostelId={hostelId} queryArgs={queryArgs} data={data} />
            ) : (
              <ShareView branch={focusedBranch} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{content.states.loading}</p>
    </div>
  );
}

function ManagerUnavailable({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Almost there.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{content.states.askSupport}</p>
      </div>
    </main>
  );
}

export function ManagerDashboard({ hostelId }: { hostelId: string }) {
  if (!convexUrl || !hostelId) {
    return (
      <ManagerUnavailable
        message={!hostelId ? content.states.notConfigured : "Convex is not configured for this dashboard."}
      />
    );
  }
  const client = new ConvexReactClient(convexUrl);
  return (
    <ConvexProvider client={client}>
      <ConvexQueryCacheProvider>
        <ManagerDashboardData hostelId={hostelId as Id<"hostels">} />
      </ConvexQueryCacheProvider>
    </ConvexProvider>
  );
}

function ManagerDashboardData({ hostelId }: { hostelId: Id<"hostels"> }) {
  // Multi-branch owner: null = at the hub. Caretaker locks override this.
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(null);
  const scopeBranchId = (branchLock() as BranchId | undefined) ?? selectedBranch;
  const data = useQuery(api.manager.get, scopeBranchId ? { hostelId, branchId: scopeBranchId } : { hostelId });
  if (data === undefined) return <LoadingState />;
  if (data === null) return <ManagerUnavailable message={content.states.notConfigured} />;
  return (
    <ManagerDataView
      hostelId={hostelId}
      data={data}
      selectedBranch={selectedBranch}
      onSelectBranch={setSelectedBranch}
    />
  );
}
