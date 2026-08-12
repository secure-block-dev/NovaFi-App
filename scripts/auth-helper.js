const { Buffer } = require('buffer');

const STORAGE_KEYS = {
  token: 'pg_token',
  user: 'pg_user',
};

const DEMO_ACCOUNT = {
  email: 'nova@demo.com',
  password: 'nova2026',
  username: 'nova',
  token: 'demo-token-nova-2026',
};

function matchesDemoAccount(email, password) {
  return String(email || '').trim().toLowerCase() === DEMO_ACCOUNT.email && String(password || '') === DEMO_ACCOUNT.password;
}

function isDemoSession(session) {
  if (!session || !session.token) return false;

  const tokenMatches = session.token === DEMO_ACCOUNT.token;
  const emailMatches = session.user && String(session.user.email || '').trim().toLowerCase() === DEMO_ACCOUNT.email;
  const usernameMatches = !session.user || String(session.user.username || '').trim().toLowerCase() === DEMO_ACCOUNT.username;

  return tokenMatches && (emailMatches || usernameMatches);
}

const BASE_URL = (() => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');
  }
  return 'http://localhost:1357';
})();

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage || window.localStorage;
  } catch {
    return null;
  }
}

function readStorageItem(key) {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEYS[key]) || null;
  } catch {
    return null;
  }
}

function writeStorageItem(key, value) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS[key], value);
  } catch {
    // Ignore storage quota/access issues in browser environments.
  }
}

function removeStorageItem(key) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS[key]);
  } catch {
    // Ignore removal failures.
  }
}

async function sha256(value) {
  const text = typeof value === 'string' ? value : String(value);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  } catch {
    return Buffer.from(text, 'utf8').toString('hex');
  }
}

function validateCredentials(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return {
      ok: false,
      message: 'Email and password are required.',
    };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      ok: false,
      message: 'Please enter a valid email address.',
    };
  }

  if (trimmedPassword.length < 6) {
    return {
      ok: false,
      message: 'Password must be at least 6 characters long.',
    };
  }

  if (matchesDemoAccount(trimmedEmail, trimmedPassword)) {
    return {
      ok: true,
      email: trimmedEmail,
      password: trimmedPassword,
      demo: true,
    };
  }

  return {
    ok: true,
    email: trimmedEmail,
    password: trimmedPassword,
  };
}

function getSession() {
  try {
    const token = readStorageItem('token');
    const user = readStorageItem('user');
    if (!token) return null;
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(getSession());
}

function clearSession() {
  removeStorageItem('token');
  removeStorageItem('user');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('novafi-auth-changed', { detail: { loggedIn: false } }));
  }
}

async function verifyTokenWithApi() {
  const session = getSession();
  if (!session || !session.token) {
    return { ok: false, reason: 'No active session.' };
  }

  if (isDemoSession(session)) {
    return {
      ok: true,
      user: session.user || {
        id: 1,
        email: DEMO_ACCOUNT.email,
        username: DEMO_ACCOUNT.username,
        created_at: new Date().toISOString(),
      },
      session,
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/pg/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (response.ok && data && data.success) {
      return { ok: true, user: data.data || session.user, session };
    }

    return { ok: false, reason: data?.msg || 'Session invalid.' };
  } catch (error) {
    return { ok: false, reason: error?.message || 'Network error.' };
  }
}

function redirectIfAuthenticated(router) {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return (async () => {
    const session = getSession();
    if (!session || !session.token) return false;

    const valid = await verifyTokenWithApi();
    if (valid.ok) {
      if (router && typeof router.push === 'function') {
        router.push('/swap');
      } else {
        window.location.href = '/swap';
      }
      return true;
    }

    clearSession();
    return false;
  })();
}

module.exports = {
  STORAGE_KEYS,
  BASE_URL,
  DEMO_ACCOUNT,
  matchesDemoAccount,
  isDemoSession,
  sha256,
  validateCredentials,
  getSession,
  isLoggedIn,
  clearSession,
  verifyTokenWithApi,
  redirectIfAuthenticated,
};
