import Logo from "@/components/Logo";
import SignInButton from "@/components/SignInButton";
import LandingBody from "@/components/landing/LandingBody";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Logo height={24} />
        <SignInButton />
      </header>

      <main className="mx-auto w-full max-w-5xl px-6">
        <section className="flex flex-col items-center pb-14 pt-16 text-center">
          <h1 className="max-w-lg font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
            Your to do list,{" "}
            <em className="text-owed-you not-italic italic">automated by AI</em>.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-soft">
            Sorrel reads your inbox and quietly tracks the commitments hiding
            inside it — the ones you made and the ones people made to you —
            then nudges before anything slips. No typing. No lists to
            maintain.
          </p>
        </section>

        <LandingBody cta={<SignInButton />} />
      </main>

      <footer className="mt-auto flex items-center justify-between border-t border-line px-6 py-6 font-mono text-xs text-ink-soft">
        <span>sorrel</span>
        <span>the commitment layer for work &amp; life</span>
      </footer>
    </div>
  );
}
