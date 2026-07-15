import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listRecentMessages } from "@/lib/gmail";
import { extractCommitments, parseDueDate } from "@/lib/extract";
import { detectResolution } from "@/lib/detectResolution";

const CONFIDENCE_THRESHOLD = 0.3;

// Guards against overlapping syncs for the same user — the client polls
// every 10s, and a slow sync (many new emails) can still be in flight when
// the next tick fires. Without this, two requests race on marking the same
// email scanned and the resulting unique-constraint error was unguarded,
// crashing the whole batch and silently dropping every email after it.
const syncInFlight = new Set<string>();

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const userId = session.user.id;

  if (syncInFlight.has(userId)) {
    return Response.json({ emailsScanned: 0, commitmentsCreated: 0, skipped: true });
  }
  syncInFlight.add(userId);

  try {
    // Default lookback is 14 days for active/short-term commitments.
    // Longer-horizon tracking (extending by stated due date rather than
    // email age) is a planned follow-up in the extraction pipeline.
    const messages = await listRecentMessages(userId, {
      days: 14,
      maxResults: 50,
    });

    const alreadyScanned = new Set(
      (
        await prisma.scannedEmail.findMany({
          where: {
            userId,
            gmailMessageId: { in: messages.map((m) => m.id) },
          },
          select: { gmailMessageId: true },
        })
      ).map((s) => s.gmailMessageId)
    );

    const newMessages = messages.filter((m) => !alreadyScanned.has(m.id));

    let commitmentsCreated = 0;

    for (const message of newMessages) {
      try {
        const extracted = await extractCommitments(message);

        for (const c of extracted) {
          if (c.confidence < CONFIDENCE_THRESHOLD) continue;

          await prisma.commitment.create({
            data: {
              userId,
              direction: c.direction,
              priority: c.priority,
              counterparty: c.counterparty,
              description: c.description,
              contextSummary: c.contextSummary,
              dueDate: parseDueDate(c.dueDate),
              confidence: c.confidence,
              sourceGmailMessageId: message.id,
              sourceThreadId: message.threadId,
              sourceSnippet: message.snippet,
            },
          });
          commitmentsCreated++;
        }
      } catch (err) {
        console.error(`Failed to process email ${message.id}:`, err);
      }

      // Idempotent by design: upsert instead of create, so a second sync
      // that somehow reaches the same email never throws.
      await prisma.scannedEmail.upsert({
        where: { userId_gmailMessageId: { userId, gmailMessageId: message.id } },
        create: { userId, gmailMessageId: message.id },
        update: {},
      });
    }

    // Loop-closed detection: polling-based (no real Gmail push webhook set
    // up). Only checked against messages that are genuinely new this run —
    // once a message has been scanned, it's never reconsidered — so this
    // stays cheap in the common case where nothing in an open thread moved.
    if (newMessages.length > 0) {
      const openCommitments = await prisma.commitment.findMany({
        where: { userId, status: "OPEN", sourceThreadId: { not: null } },
      });

      for (const message of newMessages) {
        const candidates = openCommitments.filter(
          (c) =>
            c.sourceThreadId === message.threadId &&
            c.sourceGmailMessageId !== message.id
        );

        for (const commitment of candidates) {
          try {
            const result = await detectResolution(
              commitment.description,
              message.bodyText
            );
            if (result?.resolved) {
              await prisma.commitment.update({
                where: { id: commitment.id },
                data: { readyToClose: true, closeSuggestionReason: result.reason },
              });
            }
          } catch (err) {
            console.error(
              `Failed resolution check for commitment ${commitment.id}:`,
              err
            );
          }
        }
      }
    }

    return Response.json({
      emailsScanned: newMessages.length,
      commitmentsCreated,
    });
  } finally {
    syncInFlight.delete(userId);
  }
}
