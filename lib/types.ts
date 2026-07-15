export interface CommitmentDTO {
  id: string;
  direction: "OWED_TO_YOU" | "OWED_BY_YOU";
  priority: "HIGH_PRIORITY" | "REPLY_DEBT" | "QUICK_WIN";
  counterparty: string;
  description: string;
  contextSummary: string | null;
  dueDate: string | null;
  status: "OPEN" | "SNOOZED" | "DONE";
  confidence: number;
  sourceGmailMessageId: string | null;
  sourceSnippet: string | null;
  readyToClose: boolean;
  closeSuggestionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
