export interface CommitmentDTO {
  id: string;
  direction: "OWED_TO_YOU" | "OWED_BY_YOU";
  counterparty: string;
  description: string;
  dueDate: string | null;
  status: "OPEN" | "DONE" | "SNOOZED";
  confidence: number;
  sourceSnippet: string;
  createdAt: string;
  updatedAt: string;
}
