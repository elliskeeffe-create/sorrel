import { google, gmail_v1 } from "googleapis";
import { prisma } from "@/lib/prisma";

type MessagePart = gmail_v1.Schema$MessagePart;

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  bodyText: string;
}

async function getOAuthClientForUser(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account || !account.access_token) {
    throw new Error("No linked Google account found for this user.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token ?? account.access_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : account.expires_at,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
      },
    });
  });

  return oauth2Client;
}

function decodeBody(payload: MessagePart | undefined): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  if (payload.parts) {
    const plainPart = payload.parts.find(
      (p) => p.mimeType === "text/plain"
    );
    if (plainPart) return decodeBody(plainPart);

    const htmlPart = payload.parts.find(
      (p) => p.mimeType === "text/html"
    );
    if (htmlPart) {
      return decodeBody(htmlPart).replace(/<[^>]+>/g, " ");
    }

    for (const part of payload.parts) {
      const nested = decodeBody(part);
      if (nested) return nested;
    }
  }

  return "";
}

function headerValue(headers: { name?: string | null; value?: string | null }[] | undefined, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function listRecentMessages(
  userId: string,
  { days = 30, maxResults = 50 }: { days?: number; maxResults?: number } = {}
): Promise<GmailMessage[]> {
  const auth = await getOAuthClientForUser(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: `newer_than:${days}d`,
    maxResults,
  });

  const ids = listRes.data.messages ?? [];
  const messages: GmailMessage[] = [];

  for (const { id } of ids) {
    if (!id) continue;

    const msgRes = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const payload = msgRes.data.payload;
    const headers = payload?.headers ?? [];

    messages.push({
      id,
      threadId: msgRes.data.threadId ?? id,
      subject: headerValue(headers, "Subject"),
      from: headerValue(headers, "From"),
      to: headerValue(headers, "To"),
      date: headerValue(headers, "Date"),
      snippet: msgRes.data.snippet ?? "",
      bodyText: decodeBody(payload).slice(0, 6000),
    });
  }

  return messages;
}
