// Canned data + client-side logic for the landing-page live demo.
// No backend involved — this is a believable preview of the real
// extraction pipeline, not a mock of specific API responses.

export type Direction = "OWED_TO_YOU" | "OWED_BY_YOU";
export type DemoFolder = "personal" | "business";

export interface DemoRowData {
  id: string;
  direction: Direction;
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
  folder: DemoFolder;
  from: string;
  address: string;
  sent?: boolean;
  subject: string;
  preview: string;
  date: string;
  body: string[];
  highlight?: string;
  row?: Omit<DemoRowData, "id" | "source">;
}

export const DEMO_EMAILS: DemoEmail[] = [
  {
    id: "piero-lease",
    folder: "personal",
    from: "You → Piero Rossi",
    address: "piero.rossi@gmail.com",
    sent: true,
    subject: "Re: apartment lease",
    preview: "Sounds good — I'll send over the signed lease docs by Friday.",
    date: "Jul 3",
    body: [
      "Hi Piero,",
      "Sounds good — I'll send over the signed lease docs by Friday. Let me know if the guarantor form needs anything else from my end.",
      "Ellis",
    ],
    highlight: "I'll send over the signed lease docs by Friday.",
    row: {
      direction: "OWED_BY_YOU",
      folder: "personal",
      who: "Piero",
      text: "you told him you'd send the signed lease docs.",
      meta: "promised Friday · overdue",
      hot: true,
    },
  },
  {
    id: "jake-pricing",
    folder: "business",
    from: "Jake Miller",
    address: "jake@vantageapp.io",
    subject: "Re: plan pricing question",
    preview: "Let me double-check whether the activation fee applies to both…",
    date: "Jul 8",
    body: [
      "Hey Ellis,",
      "Good question. Let me double-check whether the activation fee applies to both plans and confirm by tomorrow.",
      "Jake",
    ],
    highlight:
      "Let me double-check whether the activation fee applies to both plans and confirm by tomorrow.",
    row: {
      direction: "OWED_TO_YOU",
      folder: "business",
      who: "Jake",
      text: "said he'd confirm the activation fee applies to both plans.",
      meta: "no reply · 6 days · nudge ready",
      hot: true,
    },
  },
  {
    id: "store-promo",
    folder: "personal",
    from: "Campus Store",
    address: "deals@store.example.com",
    subject: "Don't wait — shop early for the best selection",
    preview: "View online · CLOTHING · up to 40% off this week only…",
    date: "Jul 9",
    body: [
      "Don't wait — shop early for the best selection. Up to 40% off clothing this week only.",
    ],
  },
  {
    id: "landlord-radiator",
    folder: "personal",
    from: "Dan Kowalski (landlord)",
    address: "dan.kowalski@rentwell.com",
    subject: "Re: radiator in the bedroom",
    preview: "I'll have someone out to fix the radiator next week.",
    date: "Jul 3",
    body: [
      "Ellis,",
      "Thanks for flagging it. I'll have someone out to fix the radiator next week, before it gets cold.",
      "Dan",
    ],
    highlight: "I'll have someone out to fix the radiator next week",
    row: {
      direction: "OWED_TO_YOU",
      folder: "personal",
      who: "Landlord",
      text: "promised to fix the radiator before winter.",
      meta: 'said "next week" · 11 days ago',
    },
  },
  {
    id: "dana-pricing",
    folder: "business",
    from: "You → Dana Whitfield",
    address: "dana@northbeam.co",
    sent: true,
    subject: "Re: proposal follow-up",
    preview: "You'll have full pricing from me by EOD Thursday.",
    date: "Jul 13",
    body: [
      "Dana,",
      "Great call today. You'll have full pricing from me by EOD Thursday — including the annual option we discussed.",
      "Ellis",
    ],
    highlight: "You'll have full pricing from me by EOD Thursday",
    row: {
      direction: "OWED_BY_YOU",
      folder: "business",
      who: "The client",
      text: "you said you'd get them pricing by EOD Thursday.",
      meta: "due in 4 hrs · draft waiting",
    },
  },
  {
    id: "sarah-intro",
    folder: "business",
    from: "Sarah Lin",
    address: "sarah.lin@parcelworks.com",
    subject: "Re: intro to Marcus — thank you!",
    preview: "This is perfect, thank you for connecting us!",
    date: "Jul 11",
    body: [
      "Ellis — this is perfect, thank you for connecting us! Marcus and I are grabbing time this week.",
      "Sarah",
    ],
    highlight: "thank you for connecting us!",
    row: {
      direction: "OWED_BY_YOU",
      folder: "business",
      who: "Sarah",
      text: 'you\'d "circle back" on the intro.',
      meta: "done · auto-closed ✓",
      done: true,
    },
  },
  {
    id: "design-mockups",
    folder: "business",
    from: "Maya Chen",
    address: "maya@studiofern.com",
    subject: "Revised mockups",
    preview: "Revised mockups coming your way by Thursday.",
    date: "Jul 10",
    body: [
      "Hi Ellis,",
      "Revised mockups coming your way by Thursday — we folded in all the ledger feedback from Monday.",
      "Maya",
    ],
    highlight: "Revised mockups coming your way by Thursday",
    row: {
      direction: "OWED_TO_YOU",
      folder: "business",
      who: "Design team",
      text: "owes you the revised mockups.",
      meta: "due today · on track",
    },
  },
  {
    id: "newsletter",
    folder: "personal",
    from: "The Weekly Ledger",
    address: "hello@weeklyledger.email",
    subject: "5 links on calm software",
    preview: "This week: why the best tools stay out of your way…",
    date: "Jul 12",
    body: [
      "This week: why the best tools stay out of your way, and other links on calm software.",
    ],
  },
  {
    id: "alex-invoice",
    folder: "business",
    from: "Alex Okafor",
    address: "alex@brightpine.dev",
    subject: "Re: June invoice — received",
    preview: "Got it, thanks! Processing for payment this week.",
    date: "Jul 12",
    body: [
      "Got it, thanks! Processing for payment this week.",
      "Alex",
    ],
    highlight: "Got it, thanks!",
    row: {
      direction: "OWED_BY_YOU",
      folder: "business",
      who: "Alex",
      text: "you said you'd send the June invoice.",
      meta: "delivered · auto-closed ✓",
      done: true,
    },
  },
  {
    id: "dentist",
    folder: "personal",
    from: "Cedar Dental",
    address: "frontdesk@cedardental.com",
    subject: "Please confirm your cleaning on the 22nd",
    preview: "Reply to confirm your appointment for Tuesday July 22 at 9:30am.",
    date: "Jul 13",
    body: [
      "Hi Ellis,",
      "Reply to confirm your appointment for Tuesday July 22 at 9:30am. If we don't hear back by the 18th we may release the slot.",
    ],
    highlight: "Reply to confirm your appointment for Tuesday July 22 at 9:30am.",
    row: {
      direction: "OWED_BY_YOU",
      folder: "personal",
      who: "Cedar Dental",
      text: "asked you to confirm the cleaning on the 22nd.",
      meta: "due by the 18th",
    },
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

// Which side of the ledger lands first: owed-to-you if "know what people
// owe me" was picked, owed-by-you otherwise.
export function orderEmails(
  emails: DemoEmail[],
  answers: SurveyAnswers | null
): DemoEmail[] {
  const preferred: Direction = answers?.priorities.includes("owed-me")
    ? "OWED_TO_YOU"
    : "OWED_BY_YOU";
  const ordered = [...emails];
  const firstMatch = ordered.findIndex(
    (e) => e.row && !e.row.done && e.row.direction === preferred
  );
  if (firstMatch > 0) {
    const [email] = ordered.splice(firstMatch, 1);
    ordered.unshift(email);
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
      folder: "personal",
      who: "You",
      text: text.endsWith(".") ? text : `${text}.`,
      meta: "added just now",
      source: { kind: "manual" },
    },
    ack,
  };
}
