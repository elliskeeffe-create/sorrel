import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

// Claude sometimes double-encodes tool results: a field typed as an array
// comes back as a JSON *string* of {"<key>": [...]} instead of a native
// array. Unwrap up to once so real data isn't silently dropped. Discovered
// via DEBUG_EXTRACT logging against real Gmail data — not a hypothetical.
export function unwrapArrayField(value: unknown, key: string): unknown {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && key in parsed) {
        return (parsed as Record<string, unknown>)[key];
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}
