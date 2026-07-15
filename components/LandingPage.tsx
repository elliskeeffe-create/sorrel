import Logo from "@/components/Logo";
import SignInButton from "@/components/SignInButton";
import LedgerPreview from "@/components/LedgerPreview";

const STEPS = [
  {
    n: "01 · CONNECT",
    title: "Point it at your inbox",
    body: "Connect Gmail. Sidekick scans the last 30 days on day one, so your first ledger is full in minutes. Nothing to set up.",
  },
  {
    n: "02 · EXTRACT",
    title: "It finds the promises",
    body: "Sidekick reads your mail for real commitments — \"I'll send Friday,\" \"can you confirm?\" — and skips the noise like \"let's grab coffee sometime.\"",
  },
  {
    n: "03 · CLOSE",
    title: "It keeps the loop",
    body: "See what's open at a glance. Mark something done the moment you deliver, or let it sit until you're ready to nudge.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Logo height={24} />
        <SignInButton />
      </header>

      <main className="mx-auto w-full max-w-4xl px-6">
        <section className="flex flex-col items-center py-20 text-center">
          <h1 className="max-w-lg font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            Every promise made{" "}
            <em className="text-owed-you not-italic italic">to you</em>, and
            by you.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-soft">
            Sidekick reads your inbox and quietly tracks the commitments
            hiding inside it — the ones you made and the ones people made to
            you — then nudges before anything slips. No typing. No lists to
            maintain.
          </p>
          <div className="mt-8">
            <SignInButton />
          </div>
        </section>

        <section className="pb-20">
          <LedgerPreview />
          <p className="mt-4 text-center font-mono text-xs text-ink-soft">
            The ledger is the product. Assets on the left, liabilities on
            the right, both maintained for you.
          </p>
        </section>

        <section className="border-t border-line pb-20 pt-16">
          <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-soft">
            How it works
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-card p-6">
                <div className="mb-3 font-mono text-xs tracking-wider text-owed-you">
                  {step.n}
                </div>
                <h3 className="mb-2 font-serif text-lg font-medium text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto flex items-center justify-between border-t border-line px-6 py-6 font-mono text-xs text-ink-soft">
        <span>Sidekick</span>
        <span>the commitment layer for work &amp; life</span>
      </footer>
    </div>
  );
}
