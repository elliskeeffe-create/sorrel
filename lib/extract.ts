import Anthropic from "@anthropic-ai/sdk";
import type { GmailMessage } from "@/lib/gmail";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

export interface ExtractedCommitment {
  direction: "OWED_TO_YOU" | "OWED_BY_YOU";
  counterparty: string;
  description: string;
  dueDate: string | null;
  confidence: number;
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_commitments",
  description:
    "Record the open loops (commitments, asks, follow-ups) found in this email, if any.",
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
                "OWED_TO_YOU if someone else promised something to the email owner. OWED_BY_YOU if the email owner promised something to someone else.",
            },
            counterparty: {
              type: "string",
              description:
                "The other person's name (or company), not the email owner.",
            },
            description: {
              type: "string",
              description:
                "A short, specific description of the open loop, e.g. \"send the revised mockups\" or \"call her back this weekend\".",
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
            "counterparty",
            "description",
            "dueDate",
            "confidence",
          ],
        },
      },
    },
    required: ["commitments"],
  },
};

const SYSTEM_PROMPT = `You extract open loops from a single email, for the inbox owner. An open loop is anything one person still expects from another — be generous about what counts:

- Hard promises: "I'll send the doc by Friday", "we'll get you pricing this week"
- Soft promises: "I'll look into it", "let me get back to you", "let me check"
- Requests and asks: "can you confirm by the 18th?", "give me a call this weekend", "send it over when you get a chance"
- Practical loops: appointments to confirm or RSVP, money owed, things to return or pay, a reply someone is clearly waiting on

It is better to surface a borderline loop than to miss a real one — the user can dismiss anything that doesn't belong. Use lower confidence for softer or implied loops rather than dropping them.

Only skip content with no personal action at all: marketing blasts, newsletters, automated receipts, and pure FYI notifications.

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
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "record_commitments" },
    messages: [{ role: "user", content: emailText }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) return [];

  const input = toolUse.input as { commitments?: ExtractedCommitment[] };
  return (input.commitments ?? []).filter(isValidCommitment);
}

function isValidCommitment(c: ExtractedCommitment): boolean {
  return (
    (c.direction === "OWED_TO_YOU" || c.direction === "OWED_BY_YOU") &&
    typeof c.counterparty === "string" &&
    c.counterparty.trim().length > 0 &&
    typeof c.description === "string" &&
    c.description.trim().length > 0 &&
    typeof c.confidence === "number"
  );
}
