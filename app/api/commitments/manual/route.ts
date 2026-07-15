import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCommand } from "@/lib/parseCommand";
import { isValidCommitment, parseDueDate, type ExtractedCommitment } from "@/lib/extract";

// Backs both the command bar (raw text, parsed server-side) and the
// Notepad accept flow (already-structured items from extractFromNotes) —
// one endpoint for "the user typed/confirmed this, not an email".
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json();

  const create = (item: ExtractedCommitment) =>
    prisma.commitment.create({
      data: {
        userId,
        direction: item.direction,
        priority: item.priority,
        counterparty: item.counterparty,
        description: item.description,
        contextSummary: item.contextSummary || null,
        dueDate: parseDueDate(item.dueDate),
        confidence: item.confidence,
      },
    });

  if (typeof body.text === "string" && body.text.trim()) {
    const parsed = await parseCommand(body.text.trim());
    if (!parsed) {
      return Response.json(
        { error: "Couldn't parse that into an open loop." },
        { status: 422 }
      );
    }
    const commitment = await create(parsed);
    return Response.json({ commitment });
  }

  if (Array.isArray(body.items)) {
    const valid = (body.items as ExtractedCommitment[]).filter(isValidCommitment);
    const commitments = await Promise.all(valid.map(create));
    return Response.json({ commitments });
  }

  return Response.json({ error: "Expected { text } or { items }." }, { status: 400 });
}
