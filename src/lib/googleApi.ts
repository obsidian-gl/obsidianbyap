import { getAccessToken } from './firebase';

export async function sendEmail(to: string, subject: string, bodyText: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No access token available. Please sign in again.");

  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset="UTF-8"',
    '',
    bodyText,
  ];
  const email = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64EncodedEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to send email: ${errorData.error?.message || response.statusText}`);
  }
  return response.json();
}

export async function createBirthdayEvent(userEmail: string, userName: string, dateStr: string) {
  const token = await getAccessToken();
  if (!token) throw new Error("No access token available. Please sign in again.");

  // dateStr format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-');
  const currentYear = new Date().getFullYear();
  const eventDate = `${currentYear}-${month}-${day}`;

  const event = {
    summary: `🎂 ${userName}'s Birthday!`,
    description: `Wish ${userName} a happy birthday!\nEmail: ${userEmail}`,
    start: {
      date: eventDate,
    },
    end: {
      date: eventDate,
    },
    recurrence: [
      "RRULE:FREQ=YEARLY"
    ],
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create calendar event: ${errorData.error?.message || response.statusText}`);
  }
  return response.json();
}
