import { signIn } from "@/auth";

export default function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-ink px-5 py-2.5 font-sans text-sm font-medium text-paper transition-opacity hover:opacity-90"
      >
        Sign in with Google
      </button>
    </form>
  );
}
