import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

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

  const data: Prisma.CommitmentUpdateInput = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.readyToClose !== undefined) {
    if (typeof body.readyToClose !== "boolean") {
      return Response.json({ error: "Invalid readyToClose." }, { status: 400 });
    }
    data.readyToClose = body.readyToClose;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const existing = await prisma.commitment.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const updated = await prisma.commitment.update({ where: { id }, data });

  return Response.json({ commitment: updated });
}
