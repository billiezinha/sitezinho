import { google } from 'googleapis';
import fs from 'fs';

async function test() {
  try {
    const credsStr = fs.readFileSync('.env.local', 'utf-8');
    const lines = credsStr.split('\n');
    let creds = null;
    let calendarId = null;
    for (let line of lines) {
      if (line.startsWith('GOOGLE_CALENDAR_CREDENTIALS=')) {
        let val = line.substring('GOOGLE_CALENDAR_CREDENTIALS='.length).trim();
        if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        creds = JSON.parse(val);
      }
      if (line.startsWith('GOOGLE_CALENDAR_ID=')) {
        let val = line.substring('GOOGLE_CALENDAR_ID='.length).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        calendarId = val;
      }
    }

    if (!creds || !calendarId) {
      console.error("Faltando credenciais ou calendar ID no .env.local");
      return;
    }

    console.log("Credenciais carregadas. Autenticando com Google...");
    const jwtClient = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    // Call authorize explicitly
    await jwtClient.authorize();
    console.log("Auth SUCESSO!");

    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    const event = {
      summary: "Teste de Integração Sitezinho ❤️",
      description: "Se você está vendo isso, o robô está funcionando!",
      start: { date: new Date().toISOString().split('T')[0] },
      end: { date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    };

    console.log("Inserindo evento na agenda:", calendarId);
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });

    console.log("SUCESSO! Evento criado:", response.data.htmlLink);
  } catch (err) {
    console.error("ERRO:", err.message);
  }
}

test();
