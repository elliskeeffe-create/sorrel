import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "@/lib/claudeClient";
import { isValidCommitment, type ExtractedCommitment } from "@/lib/extract";

const PARSE_TOOL: Anthropic.Tool = {
  name: "record_open_loop",
  description: "Record the single open loop described in this plain-text command.",
  input_schema: {
    type: "object",
    properties: {
      direction: {
        type: "string",
        enum: ["OWED_TO_YOU", "OWED_BY_YOU"],
        description:
          "OWED_TO_YOU if someone else owes the author an action. OWED_BY_YOU if the author owes someone else an action — this is the default for a self-directed reminder like \"remind me to...\".",
      },
      priority: {
        type: "string",
        enum: ["HIGH_PRIORITY", "REPLY_DEBT", "QUICK_WIN"],
      },
      counterparty: {
        type: "string",
        description: "The other person's name. If none is named, use \"Someone\".",
      },
      description: {
        type: "string",
        description: "Short action-verb phrase for the task itself.",
      },
      contextSummary: {
        type: "string",
        description: "One short sentence restating the intent in plain language, or empty string if the description already says it all.",
      },
      dueDate: {
        type: ["string", "null"],
        description: "ISO 8601 date (YYYY-MM-DD) resolved against today's date if a relative date like 'next Tuesday' or 'Friday' is given, otherwise null.",
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
};

function systemPrompt(today: string): string {
  return `You parse a single plain-text command into a structured open loop. Today's date is ${today} — resolve any relative dates ("next Tuesday", "Friday", "in 3 days") against it.

Hashtags like #replydebt, #highpriority, #quickwin map directly to priority if present; otherwise infer priority from tone.

direction defaults to OWED_BY_YOU (a self-directed reminder) unless the text clearly describes something someone else owes the author (e.g. "Sarah owes me the deck").

Always set confidence to 0.95 — the user typed this directly, it's not inferred.`;
}

export async function parseCommand(text: string): Promise<ExtractedCommitment | null> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: systemPrompt(today),
    tools: [PARSE_TOOL],
    tool_choice: { type: "tool", name: "record_open_loop" },
    messages: [{ role: "user", content: text }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return null;

  const item = toolUse.input as ExtractedCommitment;
  return isValidCommitment(item) ? item : null;
}
