import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractFromNotes } from "@/lib/extractFromNotes";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const entry = await prisma.scratchpadEntry.findUnique({
    where: { userId: session.user.id },
  });

  const items = await extractFromNotes(entry?.content ?? "");
  return Response.json({ items });
}
