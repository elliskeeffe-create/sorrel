import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const entry = await prisma.scratchpadEntry.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return Response.json({ content: entry.content });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const { content } = await request.json();
  if (typeof content !== "string") {
    return Response.json({ error: "Expected { content }." }, { status: 400 });
  }

  await prisma.scratchpadEntry.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, content },
    update: { content },
  });

  return Response.json({ ok: true });
}
