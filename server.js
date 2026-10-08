'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

// ============================================
// Carga opcional de .env local (cero dependencias externas)
// ============================================
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = value;
          }
        }
      }
    });
  } catch (err) {
    console.warn('[config] No se pudo leer el archivo .env:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 6666;
const isProd = process.env.NODE_ENV === 'production';

// ========================
// Security headers
// ========================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  next();
});

// ========================
// Compression (optional)
// ========================
try {
  const compression = require('compression');
  app.use(compression());
} catch (_) {
  // compression module not installed — skip
}

// ========================
// Parse JSON (limit size)
// ========================
app.use(express.json({ limit: '16kb' }));

// ========================
// Serve static files
// ========================
app.use(express.static(path.join(__dirname), {
  maxAge: isProd ? '7d' : '0',
  etag: true,
  index: 'index.html',
  // Don't serve sensitive dirs
  dotfiles: 'deny',
}));

// ========================
// Notificaciones a Telegram
// ========================
function escapeTelegramHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramNotification({ name, email, message, dateFormatted }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const threadId = process.env.TELEGRAM_THREAD_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados. Omitiendo notificación por Telegram.');
    return { sent: false, reason: 'unconfigured' };
  }

  const textLines = [
    '🎭 <b>Nuevo mensaje de contacto — jorgebarcena.es</b>',
    '',
    `👤 <b>Nombre:</b> ${escapeTelegramHtml(name)}`,
    `📧 <b>Email:</b> ${escapeTelegramHtml(email)}`,
    `📅 <b>Fecha:</b> ${escapeTelegramHtml(dateFormatted)}`,
    '',
    '📝 <b>Mensaje:</b>',
    `<blockquote>${escapeTelegramHtml(message)}</blockquote>`
  ];

  const payload = {
    chat_id: chatId,
    text: textLines.join('\n'),
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  if (threadId) {
    payload.message_thread_id = threadId;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('[telegram] Error devuelto por Telegram API:', data);
      return { sent: false, error: data };
    }

    console.log(`[telegram] Notificación enviada correctamente a Telegram (message_id: ${data.result?.message_id})`);
    return { sent: true, messageId: data.result?.message_id };
  } catch (err) {
    console.error('[telegram] Error de conexión al enviar mensaje a Telegram:', err.message);
    return { sent: false, error: err.message };
  }
}

// ========================
// In-memory rate limiter for /contacto
// ========================
const attempts = new Map();
const WINDOW_MS = 60_000;   // 1 minute
const MAX_REQ   = 3;         // max 3 per window

const rateLimitContact = (req, res, next) => {
  const ip  = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, start: now };

  if (now - rec.start > WINDOW_MS) {
    rec.count = 1;
    rec.start = now;
  } else {
    rec.count++;
  }

  attempts.set(ip, rec);

  if (rec.count > MAX_REQ) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });
  }
  next();
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  attempts.forEach((v, k) => {
    if (v.start < cutoff) attempts.delete(k);
  });
}, 5 * 60_000);

// ========================
// POST /contacto
// ========================
app.post('/contacto', rateLimitContact, (req, res) => {
  const { name, email, message, date } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  if (typeof name !== 'string' || name.length > 120) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  if (typeof email !== 'string' || email.length > 200 || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (typeof message !== 'string' || message.length > 2000) {
    return res.status(400).json({ error: 'Mensaje demasiado largo (máx 2000 caracteres)' });
  }

  // Save contact to file
  const dirPath = path.join(__dirname, 'contacto');
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const safeEmail  = email.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
  const fileName   = `${Date.now()}_${safeEmail}.txt`;
  const filePath   = path.join(dirPath, fileName);
  const parsedDate = date ? new Date(date) : new Date();
  const dateStr    = isNaN(parsedDate) ? new Date().toLocaleString('es-ES') : parsedDate.toLocaleString('es-ES');

  const content = [
    `NOMBRE:  ${name}`,
    `EMAIL:   ${email}`,
    `FECHA:   ${dateStr}`,
    '',
    'MENSAJE:',
    message,
  ].join('\n');

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      console.error('[contacto] Error al guardar:', err.message);
      return res.status(500).json({ error: 'Error al guardar el mensaje' });
    }

    console.log(`[contacto] Mensaje guardado correctamente: ${fileName} de ${name.trim()} (${email.trim()})`);

    // Enviar notificación a Telegram en segundo plano
    sendTelegramNotification({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      dateFormatted: dateStr
    }).catch((telegramErr) => {
      console.error('[telegram] Error no capturado en notificación:', telegramErr);
    });

    res.status(200).json({ ok: true });
  });
});

// ========================
// Health check
// ========================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'jorgebarcena-actor',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ========================
// Páginas legales
// ========================
app.get('/aviso-legal', (req, res) => {
  res.sendFile(path.join(__dirname, 'aviso-legal.html'));
});

app.get(['/privacidad', '/politica-de-privacidad'], (req, res) => {
  res.sendFile(path.join(__dirname, 'politica-de-privacidad.html'));
});

app.get(['/cookies', '/politica-de-cookies'], (req, res) => {
  res.sendFile(path.join(__dirname, 'politica-de-cookies.html'));
});

// ========================
// SPA fallback — serve index.html for any unmatched route
// ========================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================
// Global error handler
// ========================
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ========================
// Start server
// ========================
app.listen(PORT, () => {
  console.log(`✓ Servidor en http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
});
