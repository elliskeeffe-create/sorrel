"use client";

import { useEffect, useRef, useState } from "react";
import type { CommitmentDTO } from "@/lib/types";

export default function CommandBar({
  onCreated,
}: {
  onCreated: (commitment: CommitmentDTO) => void;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      const isShortcut = (e.metaKey || e.ctrlKey) && e.key === "k";
      const isSlash = e.key === "/" && !inField;

      if (isShortcut || isSlash) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/commitments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't add that.");
        return;
      }
      onCreated(data.commitment);
      setText("");
    } catch {
      setError("Couldn't add that. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2"
      >
        <span className="font-serif text-xs text-ink-soft">/</span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Remind me to send the signed contract to Sarah by next Tuesday #replydebt'
          className="min-w-0 flex-1 bg-transparent font-serif text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="flex-none rounded-md bg-ink px-3 py-1.5 font-serif text-xs text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "adding…" : "add"}
        </button>
      </form>
      {error && (
        <p className="mt-1 font-serif text-xs text-owed-by">{error}</p>
      )}
    </div>
  );
}
