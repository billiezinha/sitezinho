import { google } from 'googleapis';

export default async function handler(req, res) {
  // CORS setup
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

  const { title, date, time } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Título e data são obrigatórios' });
  }

  try {
    if (!process.env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID === 'undefined') {
      return res.status(500).json({ error: "Variável GOOGLE_CALENDAR_ID não encontrada", details: "Por favor, adicione na Vercel e faça um Redeploy" });
    }
    if (!process.env.GOOGLE_CALENDAR_CREDENTIALS || process.env.GOOGLE_CALENDAR_CREDENTIALS === 'undefined') {
      return res.status(500).json({ error: "Variável GOOGLE_CALENDAR_CREDENTIALS não encontrada", details: "Por favor, adicione na Vercel e faça um Redeploy" });
    }

    let credsRaw = process.env.GOOGLE_CALENDAR_CREDENTIALS || '{}';
    // Remove aspas simples ou duplas que possam ter vindo do Vercel
    if (credsRaw.startsWith("'") && credsRaw.endsWith("'")) credsRaw = credsRaw.slice(1, -1);
    if (credsRaw.startsWith('"') && credsRaw.endsWith('"')) credsRaw = credsRaw.slice(1, -1);
    
    // Se a chave vier com \\n literal, substitui por newline de verdade
    credsRaw = credsRaw.replace(/\\n/g, '\n');

    const serviceAccount = JSON.parse(credsRaw);
    const calendarId = process.env.GOOGLE_CALENDAR_ID.replace(/['"]/g, '');

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    });

    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    // Format start and end times
    let start, end;
    if (time) {
      // Create date object assuming local timezone (America/Sao_Paulo typically, but we construct ISO string)
      const dateTimeIso = `${date}T${time}:00-03:00`; // Fix timezone to Brazil if desired, or assume user timezone.
      // A safe way is to just use the provided date/time as-is in the timezone of the calendar
      start = { dateTime: dateTimeIso, timeZone: 'America/Sao_Paulo' };
      
      // End time 1 hour later
      const d = new Date(dateTimeIso);
      d.setHours(d.getHours() + 1);
      end = { dateTime: d.toISOString(), timeZone: 'America/Sao_Paulo' };
    } else {
      start = { date: date }; // full day event
      // End date must be the next day for full-day events
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      end = { date: nextDay.toISOString().split('T')[0] };
    }

    const event = {
      summary: title,
      description: 'Adicionado pelo appzinho do nosso amor ❤️',
      start: start,
      end: end,
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });

    return res.status(200).json({ success: true, link: response.data.htmlLink });
  } catch (error) {
    console.error('Erro ao adicionar no calendário:', error);
    return res.status(500).json({ error: 'Falha ao adicionar ao calendário', details: error.message });
  }
}
