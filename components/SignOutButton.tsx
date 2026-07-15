import { signOut } from "@/auth";

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="font-mono text-xs text-ink-soft transition-colors hover:text-ink"
      >
        sign out
      </button>
    </form>
  );
}
