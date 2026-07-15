const OWED_TO_YOU = [
  {
    who: "Jake",
    text: "said he'd confirm the activation fee applies to both plans.",
    meta: "no reply · 6 days · nudge ready",
    hot: true,
  },
  {
    who: "Landlord",
    text: "promised to fix the radiator before winter.",
    meta: 'said "next week" · 11 days ago',
    hot: false,
  },
  {
    who: "Design team",
    text: "owes you the revised mockups.",
    meta: "due today · on track",
    hot: false,
  },
];

const OWED_BY_YOU = [
  {
    who: "Piero",
    text: "you told him you'd send the lease docs.",
    meta: "promised Friday · overdue",
    hot: true,
  },
  {
    who: "The client",
    text: "you said you'd get them pricing by EOD Thursday.",
    meta: "due in 4 hrs · draft waiting",
    hot: false,
  },
  {
    who: "Sarah",
    text: 'you\'d "circle back" on the intro.',
    meta: "done · auto-closed ✓",
    hot: false,
  },
];

function Row({
  who,
  text,
  meta,
  hot,
  direction,
}: {
  who: string;
  text: string;
  meta: string;
  hot: boolean;
  direction: "you" | "by";
}) {
  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4 last:border-b-0">
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] text-[11px] font-semibold text-white ${
          direction === "you" ? "bg-owed-you" : "bg-owed-by"
        }`}
      >
        {direction === "you" ? "↗" : "↘"}
      </span>
      <p className="text-sm leading-snug text-ink">
        <span className="font-semibold">{who}</span> {text}
        <span
          className={`mt-1 block font-mono text-xs ${
            hot ? "text-owed-by" : "text-ink-soft"
          }`}
        >
          {meta}
        </span>
      </p>
    </div>
  );
}

export default function LedgerPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-28px_rgba(0,0,0,0.25)]">
      <div className="grid grid-cols-1 font-mono text-[11px] uppercase tracking-wider sm:grid-cols-2">
        <div className="bg-owed-you px-5 py-3 text-white">Owed to you ↗</div>
        <div className="bg-owed-by px-5 py-3 text-white">Owed by you ↘</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="sm:border-r sm:border-line">
          {OWED_TO_YOU.map((row) => (
            <Row key={row.who} {...row} direction="you" />
          ))}
        </div>
        <div>
          {OWED_BY_YOU.map((row) => (
            <Row key={row.who} {...row} direction="by" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3 font-mono text-xs text-ink-soft">
        <span>6 open loops · 2 need attention</span>
        <span>synced from Gmail · 2 min ago</span>
      </div>
    </div>
  );
}
