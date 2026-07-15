import type { ReactNode } from "react";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

const STEPS = [
  {
    n: "01 · CONNECT",
    title: "Point it at your inbox",
    body: "Connect Gmail. Sorrel scans your recent mail on day one, so your first ledger is full in minutes. Nothing to set up.",
  },
  {
    n: "02 · EXTRACT",
    title: "It finds the promises",
    body: "Sorrel reads your mail for real commitments — \"I'll send Friday,\" \"can you confirm?\" — and skips the noise like \"let's grab coffee sometime.\"",
  },
  {
    n: "03 · CLOSE",
    title: "It keeps the loop",
    body: "A loop auto-closes the moment a later email shows you delivered. Everything else waits quietly, with a receipt back to the exact thread.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line pb-20 pt-16">
      <SectionLabel>How it works</SectionLabel>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="bg-card p-6">
            <div className="mb-3 font-mono text-xs tracking-[0.12em] text-owed-you">
              {step.n}
            </div>
            <h3 className="mb-2 font-serif text-lg font-medium text-ink">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Markets() {
  return (
    <section className="border-t border-line pb-20 pt-16">
      <SectionLabel>Two markets, one engine</SectionLabel>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-7">
          <span className="mb-4 inline-block rounded-full bg-owed-you-bg px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-owed-you">
            Consumer
          </span>
          <h3 className="font-serif text-xl font-medium text-ink">
            A quiet net under your life
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            The landlord who owes a repair. The friend who owes you money. The
            reply you promised and forgot. Sorrel catches the loops your to-do
            app never sees because you never logged them.
          </p>
          <ul className="mt-4 text-sm text-ink">
            <li className="border-t border-line py-2">
              Email-based, zero manual entry
            </li>
            <li className="border-t border-line py-2">
              &ldquo;Owed to you&rdquo; nudges written for you
            </li>
            <li className="border-t border-line py-2">
              Local-first, private by default
            </li>
          </ul>
          <p className="mt-4 font-mono text-xs font-medium text-ink">
            Free · Pro $8/mo
          </p>
        </div>
        <div className="rounded-xl border border-line bg-card p-7">
          <span className="mb-4 inline-block rounded-full bg-owed-by-bg px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-owed-by">
            Team · B2B
          </span>
          <h3 className="font-serif text-xl font-medium text-ink">
            A reliability layer on your book
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            Business runs on kept commitments. Managers see which client
            promises are slipping across the team, which accounts have gone
            dark, and which reps deliver — before a deal quietly dies.
          </p>
          <ul className="mt-4 text-sm text-ink">
            <li className="border-t border-line py-2">
              Shared view of external commitments
            </li>
            <li className="border-t border-line py-2">
              Account-level &ldquo;gone dark&rdquo; alerts
            </li>
            <li className="border-t border-line py-2">
              CRM-adjacent, revenue-protecting
            </li>
          </ul>
          <p className="mt-4 font-mono text-xs font-medium text-ink">
            Team $18/seat/mo
          </p>
        </div>
      </div>
    </section>
  );
}

export function WhyNow() {
  return (
    <section className="pb-20">
      <div className="rounded-xl bg-ink px-8 py-10 sm:px-10">
        <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-[#b8b4a6]">
          Why now · why this
          <span className="h-px flex-1 bg-[#3a3a34]" />
        </div>
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[#fbf9f2]">
          The capture step finally disappeared.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#c9c5b8]">
          Every to-do app fails at the same step: capture. People won&rsquo;t
          stop to log a task, so the list is always a partial picture.
          Extraction is now cheap enough to remove that step entirely, and the
          market has rushed the &ldquo;what you owe&rdquo; side. Nobody owns
          the mirror image — the promises other people owe you — or the
          team-level ledger that turns reliability into a metric.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              k: "The wedge nobody took",
              p: "Competitors track what you owe. Sorrel leads with what you're owed — an outward ledger, not a footnote.",
            },
            {
              k: "A moat, not a script",
              p: "The single-player version is a weekend GPT call. Team-level commitment reliability is a product that compounds.",
            },
            {
              k: "Day-one value",
              p: "No cold start. Your inbox is already full of loops. The first scan is the \"oh no\" moment that sells itself.",
            },
          ].map((pt) => (
            <div key={pt.k}>
              <p className="font-serif text-[15px] font-medium text-white">
                {pt.k}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#b8b4a6]">
                {pt.p}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection({ cta }: { cta: ReactNode }) {
  return (
    <section className="flex flex-col items-center border-t border-line pb-24 pt-16 text-center">
      <h2 className="max-w-md font-serif text-3xl font-medium leading-tight tracking-tight text-ink">
        Your inbox is already full of open loops.
      </h2>
      <p className="mt-3 max-w-sm text-sm text-ink-soft">
        Connect Gmail and see your first ledger in minutes.
      </p>
      <div className="mt-7">{cta}</div>
      <p className="mt-4 font-mono text-[11px] text-ink-soft">
        free while in beta · gmail first, outlook next
      </p>
    </section>
  );
}
