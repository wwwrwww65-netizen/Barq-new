import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to get default speed value from config.js
function getConfigDefaultSpeed() {
  try {
    const configPath = path.join(__dirname, 'config.js');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      const match = content.match(/window\.siteConfig\s*=\s*(\{[\s\S]*?\});/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (parsed.speedOptions && Array.isArray(parsed.speedOptions) && parsed.speedOptions.length > 0) {
          const def = parsed.speedOptions.find(s => s.selected || s.isDefault) || parsed.speedOptions[0];
          if (def && typeof def.value === 'string') {
            return def.value;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading default speed from config.js:', err);
  }
  return 'speed_normal';
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper for MikroTik JSON vs Browser request detection
function isMikrotikAjax(req) {
  return Boolean(
    req.xhr ||
    req.query.var !== undefined ||
    req.body?.dst !== undefined ||
    req.headers['x-requested-with'] ||
    req.headers['accept']?.includes('application/json')
  );
}

// In-memory simulation session
let simulatedSession = {
  logged_in: false,
  username: '',
  domain: '',
  loginTime: null,
  ip: '192.168.88.100',
  mac: '70:85:C2:A1:3B:9E'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'barqnet-hotspot' });
});

// Notifications & announcements public content mock endpoint
app.get('/api/v1/public/content', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [],
      announcements: []
    }
  });
});

// MikroTik Hotspot login mock handler
app.all(['/login', '/login.html'], (req, res) => {
  const username = (req.query.username || req.body?.username || '').trim();
  const password = (req.query.password || req.body?.password || '').trim();
  const isAjax = isMikrotikAjax(req);

  // If a browser navigates directly to /login or /login.html without username or AJAX:
  if (!isAjax && req.method === 'GET' && !username) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  res.setHeader('Content-Type', 'application/json');

  // Test error trigger keywords for testing error dialogs/blocker:
  if (username === '2222' || username.toLowerCase() === 'expired') {
    return res.json({
      logged_in: "no",
      error: "no valid profile found",
      action: "onLoginError"
    });
  }
  if (username === '3333' || username.toLowerCase() === 'used') {
    return res.json({
      logged_in: "no",
      error: "simultaneous session limit reached",
      action: "onLoginError"
    });
  }
  if (username.toLowerCase() === 'wrong' || username.toLowerCase() === 'error') {
    return res.json({
      logged_in: "no",
      error: "invalid username or password",
      action: "onLoginError"
    });
  }

  // If no username is provided (e.g. initial handshake /login?var=callBack on page load/refresh)
  if (!username) {
    if (simulatedSession.logged_in) {
      return res.json({
        logged_in: "yes",
        username: simulatedSession.username,
        domain: simulatedSession.domain,
        link_only: "http://1.1.1.1/status",
        link_login_only: "http://1.1.1.1/login",
        link_logout: "http://1.1.1.1/logout",
        link_status: "http://1.1.1.1/status",
        nas_id: "MikroTik-Node-01",
        ip: simulatedSession.ip,
        mac: simulatedSession.mac,
        action: "onLoggedIn"
      });
    }

    return res.json({
      logged_in: "no",
      link_only: "http://1.1.1.1/status",
      link_login_only: "http://1.1.1.1/login",
      link_logout: "http://1.1.1.1/logout",
      link_status: "http://1.1.1.1/status",
      nas_id: "MikroTik-Node-01",
      ip: simulatedSession.ip,
      mac: simulatedSession.mac,
      action: "onLoginStart"
    });
  }

  // Standard login success simulation
  const defaultDomain = getConfigDefaultSpeed();
  let domain = (req.query.domain || req.body?.domain || req.query.speed || req.body?.speed || simulatedSession.domain || defaultDomain || '').trim();
  if (username.startsWith('777')) {
    domain = '';
  }

  simulatedSession = {
    logged_in: true,
    username: username,
    domain: domain,
    loginTime: Date.now(),
    ip: req.ip || "192.168.88.100",
    mac: "70:85:C2:A1:3B:9E"
  };

  if (!isAjax && !req.query.username) {
    return res.redirect('/?status=connected');
  }

  return res.json({
    logged_in: "yes",
    username: username,
    domain: domain,
    link_only: "http://1.1.1.1/status",
    link_login_only: "http://1.1.1.1/login",
    link_logout: "http://1.1.1.1/logout",
    link_status: "http://1.1.1.1/status",
    nas_id: "MikroTik-Node-01",
    ip: simulatedSession.ip,
    mac: simulatedSession.mac,
    action: "onLoggedIn"
  });
});

// MikroTik Hotspot post-login handler
app.all(['/alogin', '/alogin.html'], (req, res) => {
  const isAjax = isMikrotikAjax(req);
  if (isAjax) {
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      logged_in: simulatedSession.logged_in ? "yes" : "no",
      username: simulatedSession.username || "",
      domain: simulatedSession.domain || getConfigDefaultSpeed(),
      link_login_only: "http://1.1.1.1/login",
      ip: simulatedSession.ip,
      mac: simulatedSession.mac,
      action: "onLoggedIn"
    });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MikroTik Hotspot status JSON / HTML mock handler
app.all(['/status', '/status.html'], (req, res) => {
  const isAjax = isMikrotikAjax(req);
  const username = req.query.username || simulatedSession.username || "";
  const defaultDomain = getConfigDefaultSpeed();
  const currentSpeed = req.query.domain || req.body?.domain || simulatedSession.domain || defaultDomain || "";

  if (isAjax) {
    res.setHeader('Content-Type', 'application/json');
    const elapsedSec = simulatedSession.loginTime ? Math.max(1, Math.floor((Date.now() - simulatedSession.loginTime) / 1000)) : 13500;
    const hours = Math.floor(elapsedSec / 3600);
    const minutes = Math.floor((elapsedSec % 3600) / 60);
    const seconds = elapsedSec % 60;
    const uptimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

    const bytesInNum = 194412544 + elapsedSec * 15360;
    const bytesOutNum = 936017920 + elapsedSec * 61440;
    const bytesInNice = (bytesInNum / (1024 * 1024)).toFixed(1) + " MB";
    const bytesOutNice = (bytesOutNum / (1024 * 1024)).toFixed(1) + " MB";

    return res.json({
      logged_in: "yes",
      username: username,
      ip: simulatedSession.ip,
      mac: simulatedSession.mac,
      bytes_in: String(bytesInNum),
      bytes_out: String(bytesOutNum),
      bytes_in_nice: bytesInNice,
      bytes_out_nice: bytesOutNice,
      uptime: uptimeStr,
      remain_bytes_total: "3435973836",
      session_time_left: "6d 12h",
      domain: currentSpeed,
      spes: currentSpeed,
      sspeed: currentSpeed,
      sps: currentSpeed,
      update: currentSpeed,
      action: "onStatusQuery"
    });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MikroTik Hotspot logout mock handler
app.all(['/logout', '/logout.html'], (req, res) => {
  simulatedSession.logged_in = false;
  simulatedSession.username = '';

  const isAjax = isMikrotikAjax(req);
  if (isAjax) {
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      logged_in: "no",
      action: "onLoggedOut"
    });
  }
  res.redirect('/');
});

// MikroTik redirect handler
app.all(['/redirect', '/redirect.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static assets from project root (cards.html, dash.html, estraha.html, css/, js/, img/, fonts/, etc.)
app.use(express.static(__dirname));

// Return JSON 404 for unmatched /api/* requests
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Default fallback to index.html for client-side navigation (non-file requests)
app.use((req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('File Not Found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
