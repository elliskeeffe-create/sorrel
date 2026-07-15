import type { CommitmentDTO } from "@/lib/types";

export interface CommitmentGroup {
  key: string;
  label: string;
  items: CommitmentDTO[];
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

// Groups rows by normalized counterparty name, preserving input order and
// the first-seen display casing for the group label.
export function groupByCounterparty(rows: CommitmentDTO[]): CommitmentGroup[] {
  const groups = new Map<string, CommitmentGroup>();

  for (const row of rows) {
    const key = normalize(row.counterparty);
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(row);
    } else {
      groups.set(key, { key, label: row.counterparty, items: [row] });
    }
  }

  return [...groups.values()];
}
