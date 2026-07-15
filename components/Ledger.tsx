"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { CommitmentDTO } from "@/lib/types";
import LedgerRow from "@/components/LedgerRow";
import PeopleView from "@/components/PeopleView";
import Notepad from "@/components/Notepad";
import CommandBar from "@/components/CommandBar";
import ResolutionBanner from "@/components/ResolutionBanner";
import { groupByCounterparty } from "@/lib/groupByCounterparty";

type MainView = "ledger" | "people" | "notepad";
type View = "open" | "snoozed" | "done";

const SYNC_INTERVAL_MS = 10_000;

function isOverdueOrToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() <= today.getTime();
}

function GroupedColumn({
  rows,
  onMarkDone,
  onSnooze,
  onReopen,
}: {
  rows: CommitmentDTO[];
  onMarkDone: (id: string) => void;
  onSnooze?: (id: string) => void;
  onReopen?: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="px-5 py-4 text-sm text-ink-soft">All clear.</p>;
  }

  return (
    <>
      {groupByCounterparty(rows).map((group) => (
        <div key={group.key}>
          <p className="border-b border-line bg-paper px-5 py-1.5 font-serif text-xs font-medium text-ink-soft">
            {group.label}
          </p>
          {group.items.map((c) => (
            <LedgerRow
              key={c.id}
              commitment={c}
              onMarkDone={onMarkDone}
              onSnooze={onSnooze}
              onReopen={onReopen}
              showSender={false}
            />
          ))}
        </div>
      ))}
    </>
  );
}

export default function Ledger() {
  const [commitments, setCommitments] = useState<CommitmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("open");
  const [mainView, setMainView] = useState<MainView>("ledger");
  const syncingRef = useRef(false);

  const loadCommitments = useCallback(async () => {
    try {
      const res = await fetch("/api/commitments");
      if (!res.ok) throw new Error("Failed to load commitments.");
      const data = await res.json();
      setCommitments(data.commitments);
      setError(null);
    } catch {
      setError("Couldn't load your ledger. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed.");
      await loadCommitments();
      setError(null);
    } catch {
      setError("Sync failed. Retrying automatically.");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [loadCommitments]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadCommitments();
    runSync();
    const interval = setInterval(runSync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadCommitments, runSync]);

  const setStatus = async (
    id: string,
    status: "OPEN" | "SNOOZED" | "DONE"
  ) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    await fetch(`/api/commitments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const markDone = (id: string) => setStatus(id, "DONE");
  const snooze = (id: string) => setStatus(id, "SNOOZED");
  const reopen = (id: string) => setStatus(id, "OPEN");

  const owedToYou = commitments.filter(
    (c) => c.direction === "OWED_TO_YOU" && c.status === "OPEN"
  );
  const owedByYou = commitments.filter(
    (c) => c.direction === "OWED_BY_YOU" && c.status === "OPEN"
  );
  const openCount = owedToYou.length + owedByYou.length;
  const hotCount = [...owedToYou, ...owedByYou].filter((c) =>
    isOverdueOrToday(c.dueDate)
  ).length;

  const snoozedRows = commitments.filter((c) => c.status === "SNOOZED");
  const doneRows = commitments
    .filter((c) => c.status === "DONE")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
            Your ledger
          </h1>
          <p className="mt-1 font-serif text-xs text-ink-soft">
            {loading
              ? "loading…"
              : `${openCount} open loop${openCount === 1 ? "" : "s"}${
                  hotCount > 0
                    ? ` · ${hotCount} need${hotCount === 1 ? "s" : ""} attention`
                    : ""
                }`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 rounded-md border border-line bg-card p-0.5">
            {(["ledger", "people", "notepad"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setMainView(v)}
                className={`rounded px-2.5 py-1 font-serif text-xs capitalize ${
                  mainView === v
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex w-[8.5rem] flex-none items-center gap-2 font-serif text-xs text-ink-soft">
            <span
              className={`h-2 w-2 flex-none rounded-full ${
                syncing ? "animate-pulse bg-owed-you" : "bg-line"
              }`}
            />
            <span className="truncate">
              {syncing ? "syncing…" : "watching your inbox"}
            </span>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 font-serif text-xs text-owed-by">{error}</p>}

      {mainView === "ledger" && (
        <ResolutionBanner commitments={commitments} onResolved={loadCommitments} />
      )}

      {mainView === "ledger" && (
        <CommandBar
          onCreated={(c) => setCommitments((prev) => [c, ...prev])}
        />
      )}

      {mainView === "notepad" && <Notepad onConverted={loadCommitments} />}

      {mainView === "people" && (
        <PeopleView
          commitments={commitments}
          onMarkDone={markDone}
          onSnooze={snooze}
          onReopen={reopen}
        />
      )}

      {mainView === "ledger" && !loading && commitments.length === 0 && (
        <div className="rounded-xl border border-line bg-card px-6 py-12 text-center">
          <p className="font-serif text-lg text-ink">Nothing here yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Sorrel is quietly scanning your inbox — open loops will appear
            here automatically.
          </p>
        </div>
      )}

      {mainView === "ledger" && commitments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-28px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap gap-1 border-b border-line bg-paper px-4 py-2.5">
            <button
              onClick={() => setView("open")}
              className={`rounded px-2.5 py-1 font-serif text-[11px] uppercase tracking-wider ${
                view === "open"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Open loops
            </button>
            <button
              onClick={() => setView("snoozed")}
              className={`rounded px-2.5 py-1 font-serif text-[11px] uppercase tracking-wider ${
                view === "snoozed"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Snoozed{snoozedRows.length > 0 ? ` · ${snoozedRows.length}` : ""}
            </button>
            <button
              onClick={() => setView("done")}
              className={`rounded px-2.5 py-1 font-serif text-[11px] uppercase tracking-wider ${
                view === "done"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Recently completed
              {doneRows.length > 0 ? ` · ${doneRows.length}` : ""}
            </button>
          </div>

          {view === "open" && (
            <>
              <div className="grid grid-cols-1 font-serif text-[11px] uppercase tracking-wider sm:grid-cols-2">
                <div className="bg-owed-you px-5 py-3 text-white">
                  Owed to you ↗
                </div>
                <div className="bg-owed-by px-5 py-3 text-white">
                  Owed by you ↘
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-line sm:border-r">
                  <GroupedColumn
                    rows={owedToYou}
                    onMarkDone={markDone}
                    onSnooze={snooze}
                  />
                </div>
                <div>
                  <GroupedColumn
                    rows={owedByYou}
                    onMarkDone={markDone}
                    onSnooze={snooze}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-2.5 font-serif text-[11px] text-ink-soft">
                <span>
                  {openCount} open loop{openCount === 1 ? "" : "s"} ·{" "}
                  {hotCount} need{hotCount === 1 ? "s" : ""} attention
                </span>
                <span>synced from Gmail</span>
              </div>
            </>
          )}

          {view === "snoozed" && (
            <GroupedColumn
              rows={snoozedRows}
              onMarkDone={markDone}
              onReopen={reopen}
            />
          )}

          {view === "done" && (
            <div>
              {doneRows.length === 0 ? (
                <p className="px-5 py-4 text-sm text-ink-soft">
                  Nothing completed yet.
                </p>
              ) : (
                doneRows.map((c) => (
                  <LedgerRow key={c.id} commitment={c} onMarkDone={markDone} />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
