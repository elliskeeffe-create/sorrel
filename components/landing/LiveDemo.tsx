"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEMO_EMAILS,
  demoHeadline,
  orderEmails,
  parseChat,
  type DemoEmail,
  type DemoFolder,
  type DemoRowData,
  type SurveyAnswers,
} from "@/lib/demo";

type ScanOutcome = "none" | "extracted" | "closed";
type Phase = "idle" | "running" | "settled";
type View = "open" | "done";
type FolderFilter = "all" | DemoFolder;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function emailById(id: string): DemoEmail | undefined {
  return DEMO_EMAILS.find((e) => e.id === id);
}

// ---------- row ----------

function DemoRow({
  row,
  onSource,
}: {
  row: DemoRowData;
  onSource: (email: DemoEmail) => void;
}) {
  const toYou = row.direction === "OWED_TO_YOU";
  const sourceEmail =
    row.source.kind === "email" ? emailById(row.source.emailId) : undefined;

  return (
    <div className="animate-settle group flex items-start gap-3 border-b border-line px-5 py-4 last:border-b-0">
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-[11px] font-semibold text-white ${
          toYou ? "bg-owed-you" : "bg-owed-by"
        }`}
      >
        {toYou ? "↗" : "↘"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">
          <span className="font-semibold">{row.who}</span> {row.text}
        </p>
        <span
          className={`mt-1 block font-mono text-xs ${
            row.hot ? "text-owed-by" : "text-ink-soft"
          }`}
        >
          {row.meta}
        </span>
        <span className="mt-1.5 flex items-center gap-3">
          {sourceEmail ? (
            <button
              onClick={() => onSource(sourceEmail)}
              className="font-mono text-[11px] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              ✉ view source · {sourceEmail.from.replace("You → ", "")}
            </button>
          ) : (
            <span className="font-mono text-[11px] text-ink-soft">
              ✎ added by you
            </span>
          )}
          {!row.done && (
            <span className="hidden gap-2 font-mono text-[11px] text-ink-soft group-hover:inline-flex">
              <button
                className="hover:text-ink"
                title="Preview — not wired up in the demo"
              >
                snooze
              </button>
              <button
                className="hover:text-ink"
                title="Preview — not wired up in the demo"
              >
                done
              </button>
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

// ---------- inbox card ----------

function InboxCard({
  email,
  active,
  outcome,
}: {
  email: DemoEmail;
  active: boolean;
  outcome: ScanOutcome | undefined;
}) {
  return (
    <div
      className={`border-b border-line px-4 py-3 last:border-b-0 ${
        active ? "scan-target bg-owed-you-bg/40" : ""
      } ${outcome === "none" ? "opacity-50" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-xs font-semibold text-ink">
          {email.from}
        </span>
        <span className="flex-none font-mono text-[10px] text-ink-soft">
          {email.date}
        </span>
      </div>
      <p className="mt-0.5 truncate text-xs text-ink">{email.subject}</p>
      <p className="mt-0.5 truncate text-[11px] text-ink-soft">
        {email.preview}
      </p>
      {outcome && (
        <span
          className={`mt-1.5 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${
            outcome === "none"
              ? "text-ink-soft"
              : outcome === "closed"
                ? "bg-owed-you-bg text-owed-you"
                : email.row?.direction === "OWED_TO_YOU"
                  ? "bg-owed-you-bg text-owed-you"
                  : "bg-owed-by-bg text-owed-by"
          }`}
        >
          {outcome === "none"
            ? "no promises found"
            : outcome === "closed"
              ? "auto-closed ✓"
              : email.row?.direction === "OWED_TO_YOU"
                ? "↗ owed to you"
                : "↘ owed by you"}
        </span>
      )}
    </div>
  );
}

// ---------- source preview modal ----------

function SourceModal({
  email,
  onClose,
}: {
  email: DemoEmail;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-line bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            <p>From — {email.from}</p>
            <p className="mt-1">Date — {email.date}</p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-ink-soft hover:text-ink"
            aria-label="Close"
          >
            close ✕
          </button>
        </div>
        <h4 className="mt-4 font-serif text-lg font-medium text-ink">
          {email.subject}
        </h4>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
          {email.body.map((para, i) => {
            if (email.highlight && para.includes(email.highlight)) {
              const [before, after] = para.split(email.highlight);
              return (
                <p key={i}>
                  {before}
                  <mark
                    className={`rounded px-0.5 ${
                      email.row?.direction === "OWED_TO_YOU"
                        ? "bg-owed-you-bg"
                        : "bg-owed-by-bg"
                    }`}
                  >
                    {email.highlight}
                  </mark>
                  {after}
                </p>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
        <p className="mt-5 border-t border-line pt-3 font-mono text-[11px] text-ink-soft">
          In the real product this opens the thread in Gmail.
        </p>
      </div>
    </div>
  );
}

// ---------- calendar connect ----------

function CalendarConnect({
  connected,
  onConnect,
}: {
  connected: boolean;
  onConnect: () => void;
}) {
  if (connected) {
    return (
      <span className="font-mono text-[11px] text-owed-you">
        calendar connected ✓
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onConnect}
      className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
      title="Demo affordance — no real OAuth here"
    >
      <span aria-hidden="true">▦</span> connect calendar
    </button>
  );
}

// ---------- main ----------

export default function LiveDemo({
  answers,
  onRetake,
}: {
  answers: SurveyAnswers;
  onRetake: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Record<string, ScanOutcome>>({});
  const [rows, setRows] = useState<DemoRowData[]>([]);
  const [view, setView] = useState<View>("open");
  const [folder, setFolder] = useState<FolderFilter>("all");
  const [modalEmail, setModalEmail] = useState<DemoEmail | null>(null);
  const [ack, setAck] = useState<string | null>(null);
  const [chatText, setChatText] = useState("");
  const [calendarConnected, setCalendarConnected] = useState(false);
  const genRef = useRef(0);

  const ordered = orderEmails(DEMO_EMAILS, answers);

  const run = useCallback(async () => {
    const gen = ++genRef.current;
    setRows([]);
    setOutcomes({});
    setAck(null);
    setView("open");
    setPhase("running");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    for (const email of ordered) {
      if (genRef.current !== gen) return;
      setActiveId(email.id);
      if (!reduceMotion) await sleep(560);
      if (genRef.current !== gen) return;

      const outcome: ScanOutcome = !email.row
        ? "none"
        : email.row.done
          ? "closed"
          : "extracted";
      setOutcomes((prev) => ({ ...prev, [email.id]: outcome }));
      if (email.row) {
        setRows((prev) => [
          ...prev,
          {
            ...email.row!,
            id: email.id,
            source: { kind: "email", emailId: email.id },
          },
        ]);
      }
      if (!reduceMotion) await sleep(240);
    }
    if (genRef.current !== gen) return;
    setActiveId(null);
    setPhase("settled");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  useEffect(() => {
    const timer = setTimeout(run, 600);
    return () => {
      clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- generation counter, not a DOM ref; bumping it cancels the in-flight run
      genRef.current++;
    };
  }, [run]);

  const visible = (r: DemoRowData) => folder === "all" || r.folder === folder;
  const openRows = rows.filter((r) => !r.done && visible(r));
  const doneRows = rows.filter((r) => r.done && visible(r));
  const owedToYou = openRows.filter((r) => r.direction === "OWED_TO_YOU");
  const owedByYou = openRows.filter((r) => r.direction === "OWED_BY_YOU");
  const hotCount = openRows.filter((r) => r.hot).length;
  const showReliability =
    answers.priorities.includes("team") || answers.priorities.includes("slip");

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text) return;
    const parsed = parseChat(text, calendarConnected);
    setRows((prev) => [...prev, { ...parsed.row, id: `chat-${Date.now()}` }]);
    setAck(parsed.ack);
    setChatText("");
    setView("open");
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Live demo · a canned inbox, the real logic
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium text-ink">
            {demoHeadline(answers)}
          </h3>
        </div>
        <button
          onClick={onRetake}
          className="font-mono text-[11px] text-ink-soft underline-offset-4 hover:underline"
        >
          retake survey
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(250px,300px)_1fr]">
        {/* inbox */}
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
              Inbox · last 14 days
            </span>
            {phase === "settled" && (
              <button
                onClick={run}
                className="font-mono text-[11px] text-owed-you underline-offset-4 hover:underline"
              >
                run it again ↻
              </button>
            )}
          </div>
          <div>
            {ordered.map((email) => (
              <InboxCard
                key={email.id}
                email={email}
                active={activeId === email.id}
                outcome={outcomes[email.id]}
              />
            ))}
          </div>
        </div>

        {/* ledger */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-28px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper px-4 py-2.5">
            <div className="flex gap-1">
              <button
                onClick={() => setView("open")}
                className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  view === "open"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Open loops
              </button>
              <button
                onClick={() => setView("done")}
                className={`rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  view === "done"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Recently completed{doneRows.length > 0 ? ` · ${doneRows.length}` : ""}
              </button>
            </div>
            <div className="flex gap-1">
              {(["all", "personal", "business"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFolder(f)}
                  className={`rounded px-2 py-1 font-mono text-[10px] ${
                    folder === f
                      ? "bg-owed-you-bg text-owed-you"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {view === "open" ? (
            <>
              <div className="grid grid-cols-1 font-mono text-[11px] uppercase tracking-[0.12em] sm:grid-cols-2">
                <div className="bg-owed-you px-5 py-2.5 text-white">
                  Owed to you ↗
                </div>
                <div className="bg-owed-by px-5 py-2.5 text-white">
                  Owed by you ↘
                </div>
              </div>
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
                <div className="sm:border-r sm:border-line">
                  {owedToYou.length === 0 ? (
                    <p className="px-5 py-4 font-mono text-xs text-ink-soft">
                      {phase === "running" ? "scanning…" : "all clear"}
                    </p>
                  ) : (
                    owedToYou.map((r) => (
                      <DemoRow key={r.id} row={r} onSource={setModalEmail} />
                    ))
                  )}
                </div>
                <div>
                  {owedByYou.length === 0 ? (
                    <p className="px-5 py-4 font-mono text-xs text-ink-soft">
                      {phase === "running" ? "scanning…" : "all clear"}
                    </p>
                  ) : (
                    owedByYou.map((r) => (
                      <DemoRow key={r.id} row={r} onSource={setModalEmail} />
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1">
              {doneRows.length === 0 ? (
                <p className="px-5 py-4 font-mono text-xs text-ink-soft">
                  nothing closed yet — the scan is still running
                </p>
              ) : (
                doneRows.map((r) => (
                  <DemoRow key={r.id} row={r} onSource={setModalEmail} />
                ))
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper px-4 py-2.5 font-mono text-[11px] text-ink-soft">
            <span>
              {openRows.length} open loop{openRows.length === 1 ? "" : "s"} ·{" "}
              {hotCount} need{hotCount === 1 ? "s" : ""} attention
            </span>
            <span className="flex items-center gap-3">
              {showReliability && (
                <span className="text-owed-you">reliability 92% · 3-wk streak</span>
              )}
              <span>scanned just now</span>
            </span>
          </div>

          {/* chat-add */}
          <div className="border-t border-line px-4 py-3">
            {ack && (
              <p className="animate-settle mb-2 font-mono text-[11px] text-owed-you">
                {ack}
              </p>
            )}
            <form onSubmit={handleChat} className="flex items-center gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Add or fix something the scan missed — try “remind me Sarah owes me the deck by Friday”"
                className="min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-soft/70 focus:border-owed-you focus:outline-none"
              />
              <button
                type="submit"
                className="flex-none rounded-md bg-ink px-3 py-2 font-mono text-[11px] text-paper transition-opacity hover:opacity-90"
              >
                add
              </button>
              <CalendarConnect
                connected={calendarConnected}
                onConnect={() => setCalendarConnected(true)}
              />
            </form>
          </div>
        </div>
      </div>

      {modalEmail && (
        <SourceModal email={modalEmail} onClose={() => setModalEmail(null)} />
      )}
    </div>
  );
}
