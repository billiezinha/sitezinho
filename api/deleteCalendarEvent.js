import { google } from 'googleapis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'ID do evento é obrigatório' });
  }

  try {
    if (!process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID === 'undefined') {
      return res.status(500).json({ error: "Variável GOOGLE_CALENDAR_ID não encontrada", details: "Por favor, adicione na Vercel e faça um Redeploy" });
    }
    if (!process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_CALENDAR_CREDENTIALS === 'undefined') {
      return res.status(500).json({ error: "Variável GOOGLE_CALENDAR_CREDENTIALS não encontrada", details: "Por favor, adicione na Vercel e faça um Redeploy" });
    }

    let credsRaw = process.env.GOOGLE_CALENDAR_CREDENTIALS || '{}';
    if (credsRaw.startsWith("'") && credsRaw.endsWith("'")) credsRaw = credsRaw.slice(1, -1);

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(credsRaw);
    } catch (e) {
      const fixedCreds = credsRaw.replace(/\r?\n/g, '\\n');
      serviceAccount = JSON.parse(fixedCreds);
    }

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID.replace(/['"]/g, '');

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar no calendário:', error);
    return res.status(500).json({ error: 'Falha ao deletar do calendário', details: error.message });
  }
}
