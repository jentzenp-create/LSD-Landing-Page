// One-time helper: get a Gmail refresh token for the Stripe webhook emails.
//
// 1. Google Cloud Console > APIs & Services: enable the Gmail API.
// 2. Credentials > Create OAuth client ID > "Desktop app". Copy the client ID and secret.
// 3. OAuth consent screen: add your Gmail address as a test user (or publish the app,
//    otherwise refresh tokens expire after 7 days).
// 4. Run (PowerShell):
//      $env:GOOGLE_CLIENT_ID="..."; $env:GOOGLE_CLIENT_SECRET="..."; node scripts/gmail-auth.mjs
// 5. Open the printed link, sign in with the sending account, approve.
//    The refresh token prints here. Save it in Vercel as GMAIL_REFRESH_TOKEN.
import http from 'node:http';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.');
  process.exit(1);
}

const PORT = 53682;
const redirectUri = `http://127.0.0.1:${PORT}`;
const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.send',
    access_type: 'offline',
    prompt: 'consent',
  });

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirectUri).searchParams.get('code');
  if (!code) {
    res.end('No code in the URL.');
    return;
  }
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  const json = await tokenRes.json();
  if (json.refresh_token) {
    res.end('Done. Go back to the terminal.');
    console.log('\nGMAIL_REFRESH_TOKEN=' + json.refresh_token + '\n');
  } else {
    res.end('Failed. See the terminal.');
    console.error(json);
  }
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this link and approve access:\n\n' + authUrl + '\n');
});
