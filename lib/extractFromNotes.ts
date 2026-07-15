import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL, unwrapArrayField } from "@/lib/claudeClient";
import { isValidCommitment, type ExtractedCommitment } from "@/lib/extract";

const NOTES_TOOL: Anthropic.Tool = {
  name: "record_open_loops",
  description: "Record the open loops (action items) found in this freeform note.",
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
                "OWED_BY_YOU for the author's own to-dos (the common case in notes). OWED_TO_YOU only if the note explicitly describes something someone else owes the author.",
            },
            priority: {
              type: "string",
              enum: ["HIGH_PRIORITY", "REPLY_DEBT", "QUICK_WIN"],
            },
            counterparty: {
              type: "string",
              description: "The other person/team named, or \"Someone\" if none.",
            },
            description: { type: "string" },
            contextSummary: {
              type: "string",
              description: "One short sentence of extra context from the note, or empty string.",
            },
            dueDate: {
              type: ["string", "null"],
              description:
                "ISO 8601 date (YYYY-MM-DD) resolved against today's date if a specific or relative date is given, otherwise null.",
            },
            confidence: { type: "number" },
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

function systemPrompt(today: string): string {
  return `You scan a freeform note — brainstorming, a checklist, meeting notes — and extract concrete action items a person still needs to do or follow up on. Ignore pure observations, ideas with no action, and anything already crossed out or marked done.

Today's date is ${today} — resolve any relative dates ("Friday", "next week", "in 3 days") against it into an ISO date.

If the note contains no actionable items, call the tool with an empty commitments array.`;
}

export async function extractFromNotes(
  content: string
): Promise<ExtractedCommitment[]> {
  if (!content.trim()) return [];

  const today = new Date().toISOString().slice(0, 10);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt(today),
    tools: [NOTES_TOOL],
    tool_choice: { type: "tool", name: "record_open_loops" },
    messages: [{ role: "user", content }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return [];

  const input = toolUse.input as { commitments?: unknown };
  const raw = unwrapArrayField(input.commitments, "commitments");
  if (!Array.isArray(raw)) return [];

  return (raw as ExtractedCommitment[]).filter(isValidCommitment);
}
