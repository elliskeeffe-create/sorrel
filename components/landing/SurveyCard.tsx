"use client";

import { useState } from "react";
import {
  PRIORITY_OPTIONS,
  type PrimaryUse,
  type SurveyAnswers,
} from "@/lib/demo";

const USE_OPTIONS: { id: PrimaryUse; label: string; hint: string }[] = [
  { id: "personal", label: "Personal", hint: "promises in my own life" },
  { id: "work", label: "Work", hint: "clients & colleagues" },
  { id: "both", label: "Both", hint: "the whole picture" },
];

export default function SurveyCard({
  onDone,
}: {
  onDone: (answers: SurveyAnswers) => void;
}) {
  const [use, setUse] = useState<PrimaryUse | null>(null);
  const [priorities, setPriorities] = useState<string[]>([]);

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : prev.length >= 3
          ? prev
          : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Before you look — two quick taps
      </p>

      <h3 className="mt-4 font-serif text-lg font-medium text-ink">
        What would you mostly use this for?
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {USE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setUse(opt.id)}
            className={`rounded-md border px-3.5 py-2 text-left text-sm transition-colors ${
              use === opt.id
                ? "border-owed-you bg-owed-you-bg text-ink"
                : "border-line bg-paper text-ink-soft hover:border-ink-soft"
            }`}
          >
            <span className="font-medium text-ink">{opt.label}</span>
            <span className="ml-2 font-mono text-[11px]">{opt.hint}</span>
          </button>
        ))}
      </div>

      <h3 className="mt-6 font-serif text-lg font-medium text-ink">
        What matters most? <span className="font-mono text-xs text-ink-soft">(up to 3)</span>
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => togglePriority(opt.id)}
            className={`rounded-md border px-3.5 py-2 text-sm transition-colors ${
              priorities.includes(opt.id)
                ? "border-owed-you bg-owed-you-bg text-ink"
                : "border-line bg-paper text-ink-soft hover:border-ink-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          onClick={() => onDone({ use: "both", priorities: [] })}
          className="font-mono text-xs text-ink-soft underline-offset-4 hover:underline"
        >
          skip
        </button>
        <button
          disabled={!use}
          onClick={() => use && onDone({ use, priorities })}
          className="rounded-md bg-ink px-5 py-2.5 font-mono text-xs font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          scan the inbox →
        </button>
      </div>
    </div>
  );
}
