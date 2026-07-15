"use client";

import type { CommitmentDTO } from "@/lib/types";

const PRIORITY_LABEL: Record<CommitmentDTO["priority"], string> = {
  HIGH_PRIORITY: "high priority",
  REPLY_DEBT: "reply debt",
  QUICK_WIN: "quick win",
};

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.round(
    (date.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due today";
  if (diffDays === 1) return "due tomorrow";
  return `due ${date.toLocaleDateString()}`;
}

// One conversational badge instead of two separate tags, e.g.
// "Due tomorrow · High priority" or just "Quick win" with no due date.
function formatBadge(dueLabel: string | null, priority: CommitmentDTO["priority"]): string {
  const due = dueLabel ? dueLabel.charAt(0).toUpperCase() + dueLabel.slice(1) : null;
  const priorityLabel =
    priority.charAt(0).toUpperCase() + PRIORITY_LABEL[priority].slice(1);
  return due ? `${due} · ${priorityLabel}` : priorityLabel;
}

export default function LedgerRow({
  commitment,
  onMarkDone,
  onSnooze,
  onReopen,
  showSender = true,
}: {
  commitment: CommitmentDTO;
  onMarkDone: (id: string) => void;
  onSnooze?: (id: string) => void;
  onReopen?: (id: string) => void;
  showSender?: boolean;
}) {
  const isOwedToYou = commitment.direction === "OWED_TO_YOU";
  const dueLabel = formatDueDate(commitment.dueDate);
  const isHot =
    dueLabel === "overdue" ||
    dueLabel === "due today" ||
    commitment.priority === "HIGH_PRIORITY";
  const isDone = commitment.status === "DONE";
  const isSnoozed = commitment.status === "SNOOZED";
  const isOpen = commitment.status === "OPEN";

  return (
    <div
      className={`group flex items-start gap-3 border-b border-line px-5 py-4 last:border-b-0 ${
        commitment.readyToClose ? "border-l-2 border-l-owed-you bg-owed-you-bg/20" : ""
      }`}
    >
      <button
        onClick={() => !isDone && onMarkDone(commitment.id)}
        title={isDone ? "Completed" : "Mark done"}
        className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-[11px] font-semibold text-white transition-opacity ${
          isOwedToYou ? "bg-owed-you" : "bg-owed-by"
        } ${isDone ? "opacity-50" : "hover:opacity-80"}`}
      >
        {isDone ? "✓" : isOwedToYou ? "↗" : "↘"}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            isDone ? "text-ink-soft" : "text-ink"
          }`}
        >
          {showSender && (
            <>
              <span className="font-semibold">{commitment.counterparty}</span>{" "}
            </>
          )}
          {commitment.description}
        </p>

        {commitment.contextSummary && !isDone && (
          <p className="mt-0.5 text-xs leading-snug text-ink-soft">
            {commitment.contextSummary}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {!isDone && (
            <span
              className={`font-serif text-xs ${
                isHot ? "text-owed-by" : "text-ink-soft"
              }`}
            >
              {isSnoozed ? "snoozed" : formatBadge(dueLabel, commitment.priority)}
            </span>
          )}
          {commitment.readyToClose && (
            <span className="rounded bg-owed-you-bg px-1.5 py-0.5 font-serif text-[11px] text-owed-you">
              reply detected
            </span>
          )}
          {commitment.sourceGmailMessageId ? (
            <a
              href={`https://mail.google.com/mail/u/0/#all/${commitment.sourceGmailMessageId}`}
              target="_blank"
              rel="noopener noreferrer"
              title={commitment.sourceSnippet ?? undefined}
              className="truncate font-serif text-[11px] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              ✉ view source in Gmail
            </a>
          ) : (
            <span className="font-serif text-[11px] text-ink-soft">
              ✎ added by you
            </span>
          )}
          {isOpen && (
            <span className="hidden gap-2 font-serif text-[11px] text-ink-soft group-hover:inline-flex">
              {onSnooze && (
                <button
                  className="hover:text-ink"
                  onClick={() => onSnooze(commitment.id)}
                >
                  snooze
                </button>
              )}
              <button
                className="hover:text-ink"
                onClick={() => onMarkDone(commitment.id)}
              >
                done
              </button>
            </span>
          )}
          {isSnoozed && onReopen && (
            <button
              onClick={() => onReopen(commitment.id)}
              className="font-serif text-[11px] text-ink-soft hover:text-ink"
            >
              unsnooze
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
