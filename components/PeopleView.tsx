"use client";

import { useState } from "react";
import type { CommitmentDTO } from "@/lib/types";
import LedgerRow from "@/components/LedgerRow";
import { groupByCounterparty } from "@/lib/groupByCounterparty";

export default function PeopleView({
  commitments,
  onMarkDone,
  onSnooze,
  onReopen,
}: {
  commitments: CommitmentDTO[];
  onMarkDone: (id: string) => void;
  onSnooze: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const active = commitments.filter((c) => c.status !== "DONE");
  const groups = groupByCounterparty(active);

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card px-6 py-12 text-center">
        <p className="font-serif text-lg text-ink">No one yet.</p>
        <p className="mt-2 text-sm text-ink-soft">
          Open loops will group by person here once Sorrel finds some.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {groups.map((group) => {
        const owedToYou = group.items.filter(
          (c) => c.direction === "OWED_TO_YOU"
        );
        const owedByYou = group.items.filter(
          (c) => c.direction === "OWED_BY_YOU"
        );
        const isOpen = openKeys.has(group.key);

        return (
          <div
            key={group.key}
            className="overflow-hidden rounded-xl border border-line bg-card"
          >
            <button
              onClick={() => toggle(group.key)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left"
            >
              <span className="font-serif text-base font-medium text-ink">
                {group.label}
              </span>
              <span className="font-serif text-xs text-ink-soft">
                {[
                  owedToYou.length > 0 ? `${owedToYou.length} owed to you` : null,
                  owedByYou.length > 0 ? `${owedByYou.length} owed by you` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-line">
                {owedToYou.length > 0 && (
                  <div>
                    <p className="border-b border-line bg-paper px-5 py-1.5 font-serif text-[11px] uppercase tracking-wider text-owed-you">
                      They owe you
                    </p>
                    {owedToYou.map((c) => (
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
                )}
                {owedByYou.length > 0 && (
                  <div>
                    <p className="border-b border-line bg-paper px-5 py-1.5 font-serif text-[11px] uppercase tracking-wider text-owed-by">
                      You owe them
                    </p>
                    {owedByYou.map((c) => (
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
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
