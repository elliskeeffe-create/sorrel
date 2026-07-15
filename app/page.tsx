import { auth } from "@/auth";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import Ledger from "@/components/Ledger";
import LandingPage from "@/components/LandingPage";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const session = await auth();

  // ?landing=1 lets a signed-in user (or a dev session) preview the
  // marketing page without signing out.
  if (!session?.user || sp.landing === "1") {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Logo height={24} />
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-ink-soft">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <Ledger />
    </div>
  );
}
