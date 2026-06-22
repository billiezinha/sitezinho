import http from 'http';
import handler from './api/addCalendarEvent.js';
import fs from 'fs';

try {
  const envFile = fs.readFileSync('.env.local', 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      process.env[key] = val;
    }
  });
} catch (e) {}


const server = http.createServer((req, res) => {
  if (req.url === '/api/addCalendarEvent' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.body = JSON.parse(body);
      
      // Add a simple json() method to res for the vercel handler
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };

      handler(req, res).catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message });
      });
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Local API server running on port 3001');
});
