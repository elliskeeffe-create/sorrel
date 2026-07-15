import type Anthropic from "@anthropic-ai/sdk";
import type { GmailMessage } from "@/lib/gmail";
import { anthropic, MODEL, unwrapArrayField } from "@/lib/claudeClient";

export interface ExtractedCommitment {
  direction: "OWED_TO_YOU" | "OWED_BY_YOU";
  priority: "HIGH_PRIORITY" | "REPLY_DEBT" | "QUICK_WIN";
  counterparty: string;
  description: string;
  contextSummary: string;
  dueDate: string | null;
  confidence: number;
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_open_loops",
  description:
    "Record the open loops (action items, asks, follow-ups) found in this email, if any.",
  input_schema: {
    type: "object",
    properties: {
      commitments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            direction: {
              type: "string",
              enum: ["OWED_TO_YOU", "OWED_BY_YOU"],
              description:
                "OWED_TO_YOU if someone else is on the hook to do something for the inbox owner. OWED_BY_YOU if the inbox owner is on the hook to do something for someone else.",
            },
            priority: {
              type: "string",
              enum: ["HIGH_PRIORITY", "REPLY_DEBT", "QUICK_WIN"],
              description:
                "HIGH_PRIORITY: time-sensitive or critical (deadline, blocking, explicit urgency). REPLY_DEBT: a question or ask directed at the inbox owner that's gone unanswered — soft follow-up pressure. QUICK_WIN: a small, low-effort action that resolves in under 2 minutes (a quick reply, RSVP, one-line confirmation).",
            },
            counterparty: {
              type: "string",
              description:
                "The other person's name (or company), not the email owner.",
            },
            description: {
              type: "string",
              description:
                "The exact next physical step, as a short action-verb phrase, e.g. \"send the revised mockups\" or \"confirm the Tuesday cleaning\".",
            },
            contextSummary: {
              type: "string",
              description:
                "1-2 plain sentences briefing someone who hasn't read the thread: why this loop exists and its latest status, e.g. \"Jake confirmed the install date but is waiting on the router model number before shipping equipment.\" Written from the inbox owner's perspective, no restating of direction/priority.",
            },
            dueDate: {
              type: ["string", "null"],
              description:
                "ISO 8601 date (YYYY-MM-DD) if a specific or relative due date/deadline is stated, otherwise null.",
            },
            confidence: {
              type: "number",
              description:
                "0 to 1 confidence that this is a real open loop someone still expects resolved. Soft or implied loops are fine at moderate confidence.",
            },
          },
          required: [
            "direction",
            "priority",
            "counterparty",
            "description",
            "contextSummary",
            "dueDate",
            "confidence",
          ],
        },
      },
    },
    required: ["commitments"],
  },
};

const SYSTEM_PROMPT = `You scan a single email and extract "Open Loops" — a ruthless, practical, simple to-do list. Do not look for formal "commitments." If a message requires the inbox owner to do something, decide something, reply to something, or read something to unblock a workflow, it is an open loop.

Evaluate the email against these four extraction triggers:
1. Direct Requests — explicit asks requiring a deliverable, file, answer, or approval.
2. Reply Debt — a question asked directly to the inbox owner that appears to have gone unanswered (use REPLY_DEBT priority for these).
3. Implicit Next Steps — phrases that imply action without a formal command: "let me know your thoughts," "take a look before our call," "can we sync on this?"
4. Calendar & Scheduling — requests for availability, invites needing an RSVP, or meeting references that require prep work.

Also extract the mirror image: cases where someone else (not the inbox owner) is the one on the hook — a promise made TO the inbox owner. Classify those as OWED_TO_YOU.

Noise filter — do NOT extract from:
- Automated newsletters, promotional blasts, and system notifications.
- CC'd threads where the inbox owner is purely an observer with no action directed at them.
- Standard payment receipts, shipping confirmations, or calendar-acceptance automations.
- Cold outreach or unsolicited vendor sales pitches.

It is better to surface a borderline loop than to miss a real one — the user can dismiss anything that doesn't belong. Use lower confidence for softer or implied loops rather than dropping them.

For each loop, also write a contextSummary: 1-2 plain sentences briefing someone who hasn't read the thread on why this loop exists and its latest status. Do not restate the direction or priority — add information, don't repeat it.

priority:
- HIGH_PRIORITY: time-sensitive or critical.
- REPLY_DEBT: an unanswered ask directed at the inbox owner.
- QUICK_WIN: resolves in under 2 minutes.

direction:
- OWED_TO_YOU: someone else is on the hook to do something for the inbox owner.
- OWED_BY_YOU: the inbox owner is on the hook to do something for someone else.

If the email contains no open loops at all, call the tool with an empty commitments array.`;

export async function extractCommitments(
  email: GmailMessage
): Promise<ExtractedCommitment[]> {
  const emailText = `From: ${email.from}\nTo: ${email.to}\nDate: ${email.date}\nSubject: ${email.subject}\n\n${email.bodyText}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "record_open_loops" },
    messages: [{ role: "user", content: emailText }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (process.env.DEBUG_EXTRACT) {
    console.log(
      `[extract] "${email.subject}" stop_reason=${response.stop_reason} toolUse=${JSON.stringify(toolUse?.input)}`
    );
  }

  if (!toolUse) return [];

  const input = toolUse.input as { commitments?: unknown };
  const rawCommitments = unwrapArrayField(input.commitments, "commitments");
  if (!Array.isArray(rawCommitments)) return [];

  const raw = rawCommitments as ExtractedCommitment[];
  const valid = raw.filter(isValidCommitment);

  if (process.env.DEBUG_EXTRACT && raw.length !== valid.length) {
    console.log(
      `[extract] rejected ${raw.length - valid.length}/${raw.length} for "${email.subject}":`,
      JSON.stringify(raw.filter((c) => !isValidCommitment(c)))
    );
  }

  return valid;
}

export function isValidCommitment(c: ExtractedCommitment): boolean {
  return (
    (c.direction === "OWED_TO_YOU" || c.direction === "OWED_BY_YOU") &&
    (c.priority === "HIGH_PRIORITY" ||
      c.priority === "REPLY_DEBT" ||
      c.priority === "QUICK_WIN") &&
    typeof c.counterparty === "string" &&
    c.counterparty.trim().length > 0 &&
    typeof c.description === "string" &&
    c.description.trim().length > 0 &&
    typeof c.contextSummary === "string" &&
    typeof c.confidence === "number"
  );
}

// Defense-in-depth: the model is instructed to resolve dates to ISO 8601,
// but if it ever returns something else (a bare weekday name, "TBD", etc.)
// this keeps a bad string from reaching `new Date()` as a truthy non-date.
export function parseDueDate(dueDate: string | null): Date | null {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
  const date = new Date(dueDate);
  return Number.isNaN(date.getTime()) ? null : date;
}
