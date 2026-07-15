import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["OPEN", "DONE", "SNOOZED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status;

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const existing = await prisma.commitment.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const updated = await prisma.commitment.update({
    where: { id },
    data: { status },
  });

  return Response.json({ commitment: updated });
}
