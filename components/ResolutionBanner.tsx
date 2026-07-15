"use client";

import type { CommitmentDTO } from "@/lib/types";

export default function ResolutionBanner({
  commitments,
  onResolved,
}: {
  commitments: CommitmentDTO[];
  onResolved: () => void;
}) {
  const candidate = commitments.find(
    (c) => c.readyToClose && c.status === "OPEN"
  );
  if (!candidate) return null;

  const respond = async (accept: boolean) => {
    await fetch(`/api/commitments/${candidate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        accept ? { status: "DONE", readyToClose: false } : { readyToClose: false }
      ),
    });
    onResolved();
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-owed-you bg-owed-you-bg px-4 py-3">
      <p className="font-serif text-sm text-ink">
        {candidate.closeSuggestionReason ??
          `Looks like ${candidate.counterparty} resolved this.`}{" "}
        Close this loop?
      </p>
      <div className="flex flex-none gap-2">
        <button
          onClick={() => respond(true)}
          className="rounded-md bg-owed-you px-3 py-1.5 font-serif text-xs text-white hover:opacity-90"
        >
          yes, close loop
        </button>
        <button
          onClick={() => respond(false)}
          className="rounded-md border border-line bg-card px-3 py-1.5 font-serif text-xs text-ink-soft hover:text-ink"
        >
          keep open
        </button>
      </div>
    </div>
  );
}
