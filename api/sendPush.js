import admin from 'firebase-admin';

// Inicializa o Firebase Admin usando a chave salva na Vercel
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase Admin init error', error);
  }
}

export default async function handler(req, res) {
  // Permite CORS para requests locais/Vercel
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { title, body, tokens } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).json({ error: 'FCM tokens são obrigatórios' });
  }

  try {
    const message = {
      notification: {
        title: title || 'Nova Notificação',
        body: body || '',
      },
      tokens: tokens, // Array de tokens
    };

    // Dispara a notificação pelo Firebase!
    const response = await admin.messaging().sendEachForMulticast(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Erro ao enviar push:', error);
    return res.status(500).json({ error: 'Falha ao enviar notificação', details: error.message });
  }
}
