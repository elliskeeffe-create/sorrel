"use client";

import { useEffect, useState, useCallback } from "react";
import type { CommitmentDTO } from "@/lib/types";
import LedgerRow from "@/components/LedgerRow";
import SyncButton from "@/components/SyncButton";

export default function Ledger() {
  const [commitments, setCommitments] = useState<CommitmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"open" | "done">("open");

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    loadCommitments();
  }, [loadCommitments]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed.");
      const data = await res.json();
      setSyncMessage(
        `Scanned ${data.emailsScanned} new email${
          data.emailsScanned === 1 ? "" : "s"
        } · found ${data.commitmentsCreated} commitment${
          data.commitmentsCreated === 1 ? "" : "s"
        }`
      );
      await loadCommitments();
    } catch {
      setError("Sync failed. Try again in a moment.");
    } finally {
      setSyncing(false);
    }
  };

  const markDone = async (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "DONE" } : c))
    );
    await fetch(`/api/commitments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
  };

  const owedToYou = commitments.filter(
    (c) => c.direction === "OWED_TO_YOU" && c.status !== "DONE"
  );
  const owedByYou = commitments.filter(
    (c) => c.direction === "OWED_BY_YOU" && c.status !== "DONE"
  );
  const openCount = owedToYou.length + owedByYou.length;
  const doneRows = commitments
    .filter((c) => c.status === "DONE")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
            Your ledger
          </h1>
          <p className="mt-1 font-mono text-xs text-ink-soft">
            {loading ? "loading…" : `${openCount} open loop${openCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <SyncButton onSync={handleSync} syncing={syncing} />
      </div>

      {syncMessage && (
        <p className="mb-4 font-mono text-xs text-owed-you">{syncMessage}</p>
      )}
      {error && (
        <p className="mb-4 font-mono text-xs text-owed-by">{error}</p>
      )}

      {!loading && commitments.length === 0 && (
        <div className="rounded-xl border border-line bg-card px-6 py-12 text-center">
          <p className="font-serif text-lg text-ink">Nothing here yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Click sync inbox to scan your recent email for commitments.
          </p>
        </div>
      )}

      {commitments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-28px_rgba(0,0,0,0.25)]">
          <div className="flex gap-1 border-b border-line bg-paper px-4 py-2.5">
            <button
              onClick={() => setView("open")}
              className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                view === "open"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Open loops
            </button>
            <button
              onClick={() => setView("done")}
              className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                view === "done"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Recently completed{doneRows.length > 0 ? ` · ${doneRows.length}` : ""}
            </button>
          </div>

          {view === "open" ? (
            <>
              <div className="grid grid-cols-1 font-mono text-[11px] uppercase tracking-wider sm:grid-cols-2">
                <div className="bg-owed-you px-5 py-3 text-white">
                  Owed to you ↗
                </div>
                <div className="bg-owed-by px-5 py-3 text-white">
                  Owed by you ↘
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-line sm:border-r">
                  {owedToYou.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-ink-soft">All clear.</p>
                  ) : (
                    owedToYou.map((c) => (
                      <LedgerRow key={c.id} commitment={c} onMarkDone={markDone} />
                    ))
                  )}
                </div>
                <div>
                  {owedByYou.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-ink-soft">All clear.</p>
                  ) : (
                    owedByYou.map((c) => (
                      <LedgerRow key={c.id} commitment={c} onMarkDone={markDone} />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
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
