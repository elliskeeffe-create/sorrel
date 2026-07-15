import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "@/lib/claudeClient";

const TOOL: Anthropic.Tool = {
  name: "classify_resolution",
  description: "Classify whether a new email message resolves an existing open loop.",
  input_schema: {
    type: "object",
    properties: {
      resolved: {
        type: "boolean",
        description:
          "True only if this message clearly shows the specific action was completed, answered, or delivered — not just acknowledged or still being discussed.",
      },
      reason: {
        type: "string",
        description:
          'One short user-facing sentence for a confirmation banner, e.g. "You replied to Jake with the IMEI details."',
      },
    },
    required: ["resolved", "reason"],
  },
};

const SYSTEM_PROMPT = `You determine whether a new email message resolves a previously tracked open loop, or if it's just ongoing discussion in the same thread. Be conservative — only mark resolved:true when the specific action described in the open loop clearly happened.`;

export async function detectResolution(
  loopDescription: string,
  newMessageText: string
): Promise<{ resolved: boolean; reason: string } | null> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    tools: [TOOL],
    tool_choice: { type: "tool", name: "classify_resolution" },
    messages: [
      {
        role: "user",
        content: `Open loop: "${loopDescription}"\n\nNew message in the same thread:\n${newMessageText}`,
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return null;

  const input = toolUse.input as { resolved?: unknown; reason?: unknown };
  if (typeof input.resolved !== "boolean" || typeof input.reason !== "string") {
    return null;
  }
  return { resolved: input.resolved, reason: input.reason };
}
