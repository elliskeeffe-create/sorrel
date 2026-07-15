"use client";

export default function SyncButton({
  onSync,
  syncing,
}: {
  onSync: () => void;
  syncing: boolean;
}) {
  return (
    <button
      onClick={onSync}
      disabled={syncing}
      className="rounded-md bg-ink px-4 py-2 font-mono text-xs font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {syncing ? "syncing…" : "sync inbox"}
    </button>
  );
}
