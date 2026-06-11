'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
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
// Serve static files — FIX: root dir, not "public/"
// ========================
app.use(express.static(path.join(__dirname), {
  maxAge: isProd ? '7d' : '0',
  etag: true,
  index: 'index.html',
  // Don't serve sensitive dirs
  dotfiles: 'deny',
}));

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
    res.status(200).json({ ok: true });
  });
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
