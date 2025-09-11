// scripts/get-refresh-token.ts
import { google } from 'googleapis';
import readline from 'readline';
import { loadDotenv } from '../src/common/utils/dotenv';

loadDotenv();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_MAILER_CLIENT_ID,
  process.env.GOOGLE_MAILER_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob', // Для offline access
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  prompt: 'consent', // Важно для получения refresh token
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      return console.error('Error getting tokens:', err);
    }

    if (tokens) {
      console.log('Refresh token:', tokens.refresh_token);
      console.log('Add this to your .env file as GOOGLE_MAILER_REFRESH_TOKEN');
    }

    rl.close();
  });
});
