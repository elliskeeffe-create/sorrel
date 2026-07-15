"use client";

import type { CommitmentDTO } from "@/lib/types";

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.round(
    (date.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return `overdue · ${date.toLocaleDateString()}`;
  if (diffDays === 0) return "due today";
  if (diffDays === 1) return "due tomorrow";
  return `due ${date.toLocaleDateString()}`;
}

export default function LedgerRow({
  commitment,
  onMarkDone,
}: {
  commitment: CommitmentDTO;
  onMarkDone: (id: string) => void;
}) {
  const isOwedToYou = commitment.direction === "OWED_TO_YOU";
  const dueLabel = formatDueDate(commitment.dueDate);
  const isHot = dueLabel?.startsWith("overdue") || dueLabel === "due today";
  const isDone = commitment.status === "DONE";

  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4 last:border-b-0">
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-[11px] font-semibold text-white ${
          isOwedToYou ? "bg-owed-you" : "bg-owed-by"
        }`}
      >
        {isOwedToYou ? "↗" : "↘"}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            isDone ? "text-ink-soft line-through" : "text-ink"
          }`}
        >
          <span className="font-semibold">{commitment.counterparty}</span>{" "}
          {commitment.description}
        </p>
        {dueLabel && !isDone && (
          <span
            className={`mt-1 block font-mono text-xs ${
              isHot ? "text-owed-by" : "text-ink-soft"
            }`}
          >
            {dueLabel}
          </span>
        )}
        <a
          href={`https://mail.google.com/mail/u/0/#all/${commitment.sourceGmailMessageId}`}
          target="_blank"
          rel="noopener noreferrer"
          title={commitment.sourceSnippet}
          className="mt-1.5 block truncate font-mono text-[11px] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          ✉ view source in Gmail
        </a>
      </div>
      {!isDone && (
        <button
          onClick={() => onMarkDone(commitment.id)}
          className="flex-none rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          done
        </button>
      )}
    </div>
  );
}
