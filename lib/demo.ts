// Canned data + client-side logic for the landing-page live demo.
// No backend involved — this is a believable preview of the real
// extraction pipeline, not a mock of specific API responses.

export type Direction = "OWED_TO_YOU" | "OWED_BY_YOU";
export type DemoFolder = "personal" | "business";
export type Priority = "HIGH_PRIORITY" | "REPLY_DEBT" | "QUICK_WIN";

export interface DemoRowData {
  id: string;
  direction: Direction;
  priority: Priority;
  folder: DemoFolder;
  who: string;
  text: string;
  meta: string;
  hot?: boolean;
  done?: boolean;
  source: { kind: "email"; emailId: string } | { kind: "manual" };
}

export interface DemoEmail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string[];
  highlight?: string;
  direction?: Direction;
}

// Source emails backing the ledger rows — opened via the "view source"
// receipt on each row.
export const DEMO_EMAILS: DemoEmail[] = [
  {
    id: "piero-lease",
    from: "You → Piero Rossi",
    subject: "Re: apartment lease",
    date: "Jul 3",
    body: [
      "Hi Piero,",
      "Sounds good — I'll send over the signed lease docs by Friday. Let me know if the guarantor form needs anything else from my end.",
      "Ellis",
    ],
    highlight: "I'll send over the signed lease docs by Friday.",
    direction: "OWED_BY_YOU",
  },
  {
    id: "jake-pricing",
    from: "Jake Miller",
    subject: "Re: plan pricing question",
    date: "Jul 8",
    body: [
      "Hey Ellis,",
      "Good question. Let me double-check whether the activation fee applies to both plans and confirm by tomorrow.",
      "Jake",
    ],
    highlight:
      "Let me double-check whether the activation fee applies to both plans and confirm by tomorrow.",
    direction: "OWED_TO_YOU",
  },
  {
    id: "landlord-radiator",
    from: "Dan Kowalski (landlord)",
    subject: "Re: radiator in the bedroom",
    date: "Jul 3",
    body: [
      "Ellis,",
      "Thanks for flagging it. I'll have someone out to fix the radiator next week, before it gets cold.",
      "Dan",
    ],
    highlight: "I'll have someone out to fix the radiator next week",
    direction: "OWED_TO_YOU",
  },
  {
    id: "dana-pricing",
    from: "You → Dana Whitfield",
    subject: "Re: proposal follow-up",
    date: "Jul 13",
    body: [
      "Dana,",
      "Great call today. You'll have full pricing from me by EOD Thursday — including the annual option we discussed.",
      "Ellis",
    ],
    highlight: "You'll have full pricing from me by EOD Thursday",
    direction: "OWED_BY_YOU",
  },
  {
    id: "design-mockups",
    from: "Maya Chen",
    subject: "Revised mockups",
    date: "Jul 10",
    body: [
      "Hi Ellis,",
      "Revised mockups coming your way by Thursday — we folded in all the ledger feedback from Monday.",
      "Maya",
    ],
    highlight: "Revised mockups coming your way by Thursday",
    direction: "OWED_TO_YOU",
  },
  {
    id: "dentist",
    from: "Cedar Dental",
    subject: "Please confirm your cleaning on the 22nd",
    date: "Jul 13",
    body: [
      "Hi Ellis,",
      "Reply to confirm your appointment for Tuesday July 22 at 9:30am. If we don't hear back by the 18th we may release the slot.",
    ],
    highlight: "Reply to confirm your appointment for Tuesday July 22 at 9:30am.",
    direction: "OWED_BY_YOU",
  },
  {
    id: "mom-call",
    from: "Mom",
    subject: "this weekend?",
    date: "Jul 12",
    body: [
      "Hi sweetheart,",
      "Give me a call this weekend when you get a chance — want to hear how the new place is coming along.",
      "Love, Mom",
    ],
    highlight: "Give me a call this weekend when you get a chance",
    direction: "OWED_BY_YOU",
  },
  {
    id: "priya-flights",
    from: "Priya Nair",
    subject: "Re: reunion planning",
    date: "Jul 11",
    body: [
      "So excited this is happening!!",
      "I'll look into flights for the reunion weekend and report back with options.",
      "Priya",
    ],
    highlight: "I'll look into flights for the reunion weekend",
    direction: "OWED_TO_YOU",
  },
  {
    id: "sarah-intro",
    from: "Sarah Lin",
    subject: "Re: intro to Marcus — thank you!",
    date: "Jul 11",
    body: [
      "Ellis — this is perfect, thank you for connecting us! Marcus and I are grabbing time this week.",
      "Sarah",
    ],
    highlight: "thank you for connecting us!",
    direction: "OWED_BY_YOU",
  },
  {
    id: "alex-invoice",
    from: "Alex Okafor",
    subject: "Re: June invoice — received",
    date: "Jul 12",
    body: ["Got it, thanks! Processing for payment this week.", "Alex"],
    highlight: "Got it, thanks!",
    direction: "OWED_BY_YOU",
  },
];

// The ledger itself. Deliberately loose about what counts: hard promises,
// soft "I'll look into it"s, asks from family, appointments to confirm —
// anything someone still expects from someone else.
export const DEMO_ROWS: DemoRowData[] = [
  {
    id: "row-piero",
    direction: "OWED_BY_YOU",
    priority: "HIGH_PRIORITY",
    folder: "personal",
    who: "Piero",
    text: "you told him you'd send the signed lease docs.",
    meta: "promised Friday · overdue",
    hot: true,
    source: { kind: "email", emailId: "piero-lease" },
  },
  {
    id: "row-jake",
    direction: "OWED_TO_YOU",
    priority: "REPLY_DEBT",
    folder: "business",
    who: "Jake",
    text: "said he'd confirm the activation fee applies to both plans.",
    meta: "no reply · 6 days · nudge ready",
    hot: true,
    source: { kind: "email", emailId: "jake-pricing" },
  },
  {
    id: "row-landlord",
    direction: "OWED_TO_YOU",
    priority: "REPLY_DEBT",
    folder: "personal",
    who: "Landlord",
    text: "promised to fix the radiator before winter.",
    meta: 'said "next week" · 11 days ago',
    source: { kind: "email", emailId: "landlord-radiator" },
  },
  {
    id: "row-dana",
    direction: "OWED_BY_YOU",
    priority: "HIGH_PRIORITY",
    folder: "business",
    who: "The client",
    text: "you said you'd get them pricing by EOD Thursday.",
    meta: "due in 4 hrs · draft waiting",
    source: { kind: "email", emailId: "dana-pricing" },
  },
  {
    id: "row-design",
    direction: "OWED_TO_YOU",
    priority: "HIGH_PRIORITY",
    folder: "business",
    who: "Design team",
    text: "owes you the revised mockups.",
    meta: "due today · on track",
    source: { kind: "email", emailId: "design-mockups" },
  },
  {
    id: "row-dentist",
    direction: "OWED_BY_YOU",
    priority: "QUICK_WIN",
    folder: "personal",
    who: "Cedar Dental",
    text: "asked you to confirm the cleaning on the 22nd.",
    meta: "due by the 18th",
    source: { kind: "email", emailId: "dentist" },
  },
  {
    id: "row-mom",
    direction: "OWED_BY_YOU",
    priority: "QUICK_WIN",
    folder: "personal",
    who: "Mom",
    text: "asked you to call her this weekend.",
    meta: "soft ask · no deadline",
    source: { kind: "email", emailId: "mom-call" },
  },
  {
    id: "row-priya",
    direction: "OWED_TO_YOU",
    priority: "REPLY_DEBT",
    folder: "personal",
    who: "Priya",
    text: 'said she\'d "look into" flights for the reunion.',
    meta: "soft promise · 3 days ago",
    source: { kind: "email", emailId: "priya-flights" },
  },
  {
    id: "row-sarah",
    direction: "OWED_BY_YOU",
    priority: "QUICK_WIN",
    folder: "business",
    who: "Sarah",
    text: 'you\'d "circle back" on the intro.',
    meta: "done · auto-closed ✓",
    done: true,
    source: { kind: "email", emailId: "sarah-intro" },
  },
  {
    id: "row-alex",
    direction: "OWED_BY_YOU",
    priority: "QUICK_WIN",
    folder: "business",
    who: "Alex",
    text: "you said you'd send the June invoice.",
    meta: "delivered · auto-closed ✓",
    done: true,
    source: { kind: "email", emailId: "alex-invoice" },
  },
];

// ---- onboarding survey ----

export type PrimaryUse = "personal" | "work" | "both";

export interface SurveyAnswers {
  use: PrimaryUse;
  priorities: string[];
}

export const PRIORITY_OPTIONS = [
  { id: "slip", label: "Don't let things I promised slip" },
  { id: "owed-me", label: "Know what people owe me" },
  { id: "glance", label: "See what's overdue vs on track" },
  { id: "team", label: "Team visibility — who's dropping the ball" },
  { id: "setup", label: "Minimal setup" },
] as const;

const SURVEY_KEY = "sorrel-survey-v1";

export function loadSurvey(): SurveyAnswers | null {
  try {
    const raw = localStorage.getItem(SURVEY_KEY);
    return raw ? (JSON.parse(raw) as SurveyAnswers) : null;
  } catch {
    return null;
  }
}

export function saveSurvey(answers: SurveyAnswers) {
  try {
    localStorage.setItem(SURVEY_KEY, JSON.stringify(answers));
  } catch {
    // localStorage unavailable (private mode) — demo still works for the session
  }
}

export function clearSurvey() {
  try {
    localStorage.removeItem(SURVEY_KEY);
  } catch {
    // ignore
  }
}

// Which side of the ledger fills first: owed-to-you if "know what people
// owe me" was picked, owed-by-you otherwise.
export function orderRows(
  rows: DemoRowData[],
  answers: SurveyAnswers | null
): DemoRowData[] {
  const preferred: Direction = answers?.priorities.includes("owed-me")
    ? "OWED_TO_YOU"
    : "OWED_BY_YOU";
  const ordered = [...rows];
  const firstMatch = ordered.findIndex(
    (r) => !r.done && r.direction === preferred
  );
  if (firstMatch > 0) {
    const [row] = ordered.splice(firstMatch, 1);
    ordered.unshift(row);
  }
  return ordered;
}

export function demoHeadline(answers: SurveyAnswers | null): string {
  switch (answers?.use) {
    case "personal":
      return "Watching the promises in your personal life.";
    case "work":
      return "Watching commitments across your team.";
    case "both":
      return "Watching every open loop across work and life.";
    default:
      return "Watching your open loops.";
  }
}

// ---- chat-add: canned parsing, no AI ----

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseChat(
  raw: string,
  calendarConnected: boolean
): { row: Omit<DemoRowData, "id">; ack: string } {
  const ack = calendarConnected
    ? "Added — tracking against your Google Calendar."
    : "Added — I'll keep an eye on it.";
  const text = raw.trim().replace(/^remind me( that)?\s+/i, "");

  let m = text.match(/^(.+?)\s+owes me\s+(?:the\s+)?(.+?)(?:\s+by\s+(.+?))?[.!]?$/i);
  if (m) {
    return {
      row: {
        direction: "OWED_TO_YOU",
        priority: m[3] ? "HIGH_PRIORITY" : "QUICK_WIN",
        folder: "personal",
        who: cap(m[1]),
        text: `owes you the ${m[2]}.`,
        meta: m[3] ? `due ${cap(m[3])} · added just now` : "added just now",
        source: { kind: "manual" },
      },
      ack,
    };
  }

  m = text.match(/^i (?:owe|promised)\s+(\w+)\s+(?:the\s+)?(.+?)(?:\s+by\s+(.+?))?[.!]?$/i);
  if (m) {
    return {
      row: {
        direction: "OWED_BY_YOU",
        priority: m[3] ? "HIGH_PRIORITY" : "QUICK_WIN",
        folder: "personal",
        who: cap(m[1]),
        text: `you owe them the ${m[2]}.`,
        meta: m[3] ? `due ${cap(m[3])} · added just now` : "added just now",
        source: { kind: "manual" },
      },
      ack,
    };
  }

  return {
    row: {
      direction: "OWED_BY_YOU",
      priority: "QUICK_WIN",
      folder: "personal",
      who: "You",
      text: text.endsWith(".") ? text : `${text}.`,
      meta: "added just now",
      source: { kind: "manual" },
    },
    ack,
  };
}
