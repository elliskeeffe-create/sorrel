"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedCommitment } from "@/lib/extract";

const AUTOSAVE_DELAY_MS = 800;

export default function Notepad({ onConverted }: { onConverted: () => void }) {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [candidates, setCandidates] = useState<ExtractedCommitment[] | null>(null);
  const [converting, setConverting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/scratchpad");
        const data = await res.json();
        setContent(data.content ?? "");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const handleChange = (value: string) => {
    setContent(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/scratchpad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
    }, AUTOSAVE_DELAY_MS);
  };

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const res = await fetch("/api/scratchpad/extract", { method: "POST" });
      const data = await res.json();
      setCandidates(data.items ?? []);
    } finally {
      setExtracting(false);
    }
  };

  const handleConvert = async () => {
    if (!candidates || candidates.length === 0) return;
    setConverting(true);
    try {
      await fetch("/api/commitments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: candidates }),
      });
      setCandidates(null);
      onConverted();
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={
          loaded ? "Brainstorm, meeting notes, a checklist — anything." : "loading…"
        }
        disabled={!loaded}
        className="min-h-[60vh] w-full resize-none rounded-xl border border-line bg-card p-6 font-serif text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/60 focus:border-owed-you focus:outline-none"
      />

      <button
        onClick={handleExtract}
        disabled={extracting || !content.trim()}
        className="absolute bottom-5 right-5 rounded-md bg-ink px-4 py-2 font-serif text-xs text-paper shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {extracting ? "reading…" : "summarize & extract tasks"}
      </button>

      {candidates && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4"
          onClick={() => setCandidates(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {candidates.length === 0 ? (
              <p className="text-sm text-ink-soft">
                No action items found in your notes.
              </p>
            ) : (
              <>
                <p className="font-serif text-base text-ink">
                  We found {candidates.length} action item
                  {candidates.length === 1 ? "" : "s"}. Convert to open loops?
                </p>
                <div className="mt-4 max-h-64 space-y-2 overflow-y-auto border-y border-line py-3">
                  {candidates.map((c, i) => (
                    <p key={i} className="text-sm text-ink">
                      <span className="font-semibold">{c.counterparty}</span>{" "}
                      {c.description}
                    </p>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setCandidates(null)}
                    className="rounded-md border border-line px-3.5 py-2 font-serif text-xs text-ink-soft hover:text-ink"
                  >
                    discard
                  </button>
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="rounded-md bg-ink px-3.5 py-2 font-serif text-xs text-paper hover:opacity-90 disabled:opacity-40"
                  >
                    {converting ? "adding…" : "convert to open loops"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
