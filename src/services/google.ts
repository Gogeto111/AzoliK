// Google OAuth 2.0 Service for Gmail, Sheets, Calendar
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${window.location.origin}/integrations/callback`;

const GOOGLE_SCOPES = {
  gmail: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
  ],
  sheets: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
  calendar: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ],
  drive: [
    "https://www.googleapis.com/auth/drive.file",
  ],
};

export function getGoogleAuthUrl(service: keyof typeof GOOGLE_SCOPES, state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES[service].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  
  if (state) params.append("state", state);
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Token exchange failed");
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}

// Gmail API
export async function sendGmail(accessToken: string, to: string, subject: string, body: string, threadId?: string) {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    threadId ? `In-Reply-To: ${threadId}` : "",
    threadId ? `References: ${threadId}` : "",
    "Content-Type: text/html; charset=utf-8",
    "",
    body,
  ].join("\n");

  const encoded = btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  });

  return response.json();
}

export async function listGmailMessages(accessToken: string, query: string, maxResults = 10) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );
  return response.json();
}

export async function getGmailMessage(accessToken: string, messageId: string) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );
  return response.json();
}

// Google Sheets API
export async function readSheet(accessToken: string, spreadsheetId: string, range: string) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );
  return response.json();
}

export async function writeSheet(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  return response.json();
}

export async function appendSheet(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  return response.json();
}

export async function createSpreadsheet(accessToken: string, title: string, sheets: string[] = ["Sheet1"]) {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheets.map(s => ({ properties: { title: s } })),
    }),
  });
  return response.json();
}

// Google Calendar API
export async function listCalendars(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
  return response.json();
}

export async function createCalendarEvent(accessToken: string, calendarId: string, event: {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
  reminders?: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
}) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  return response.json();
}

export async function listCalendarEvents(accessToken: string, calendarId: string, timeMin: string, timeMax: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
    { headers: { "Authorization": `Bearer ${accessToken}` } }
  );
  return response.json();
}

export async function updateCalendarEvent(accessToken: string, calendarId: string, eventId: string, event: any) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  return response.json();
}

// Google Drive API
export async function uploadFile(accessToken: string, file: File, folderId?: string) {
  const metadata = {
    name: file.name,
    parents: folderId ? [folderId] : undefined,
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
    body: form,
  });
  return response.json();
}

// Token storage helpers
export function saveTokens(service: string, tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  localStorage.setItem(`google_${service}_tokens`, JSON.stringify({
    ...tokens,
    expires_at: expiresAt,
  }));
}

export function getTokens(service: string): { access_token: string; refresh_token: string; expires_at: number } | null {
  const stored = localStorage.getItem(`google_${service}_tokens`);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function clearTokens(service: string) {
  localStorage.removeItem(`google_${service}_tokens`);
}

export async function getValidAccessToken(service: string): Promise<string | null> {
  const tokens = getTokens(service);
  if (!tokens) return null;

  if (Date.now() < tokens.expires_at - 60000) {
    return tokens.access_token;
  }

  // Refresh token
  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    saveTokens(service, {
      access_token: refreshed.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: refreshed.expires_in,
    });
    return refreshed.access_token;
  } catch {
    clearTokens(service);
    return null;
  }
}