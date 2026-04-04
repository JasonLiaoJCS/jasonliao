const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ADMIN_COOKIE = 'jl_admin_session';
const ACQUAINTANCE_COOKIE = 'jl_acquaintance_session';

function toBase64Url(bytes){
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value){
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for(let i = 0; i < binary.length; i += 1){
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(left, right){
  if(left.length !== right.length) return false;
  let result = 0;
  for(let i = 0; i < left.length; i += 1){
    result |= left[i] ^ right[i];
  }
  return result === 0;
}

async function signValue(value, secret){
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSignedToken(payload, secret){
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifySignedToken(token, secret){
  if(!token || !secret || !token.includes('.')) return null;
  try {
    const [encoded, providedSignature] = token.split('.');
    const expectedSignature = await signValue(encoded, secret);
    if(!timingSafeEqual(fromBase64Url(providedSignature), fromBase64Url(expectedSignature))){
      return null;
    }
    const payload = JSON.parse(decoder.decode(fromBase64Url(encoded)));
    if(payload.exp && Date.now() > payload.exp){
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(request){
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = {};
  cookieHeader.split(';').forEach(entry => {
    const [rawName, ...rawValue] = entry.trim().split('=');
    if(!rawName) return;
    cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
  });
  return cookies;
}

export function serializeCookie(name, value, options = {}){
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if(options.httpOnly !== false) parts.push('HttpOnly');
  if(options.secure !== false) parts.push('Secure');
  if(options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if(typeof options.maxAge === 'number') parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if(options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join('; ');
}

export function clearCookie(name){
  return serializeCookie(name, '', { maxAge: 0, expires: new Date(0) });
}

export async function verifyPassword(password, encodedHash){
  if(!password || !encodedHash) return false;
  const [scheme, iterationsText, saltB64, hashB64] = encodedHash.split('$');
  if(scheme !== 'pbkdf2_sha256') return false;
  const iterations = Number(iterationsText);
  if(!Number.isFinite(iterations) || iterations < 100000) return false;

  const salt = fromBase64Url(saltB64);
  const expectedHash = fromBase64Url(hashB64);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    expectedHash.length * 8,
  );
  return timingSafeEqual(new Uint8Array(derivedBits), expectedHash);
}

function getSessionSecrets(env){
  return {
    adminSecret: env.ADMIN_SESSION_SECRET || '',
    adminUsername: env.ADMIN_USERNAME || '',
    adminPasswordHash: env.ADMIN_PASSWORD_HASH || '',
    acquaintancePasswordHash: env.ACQUAINTANCE_PASSWORD_HASH || '',
  };
}

export async function createAdminSession(username, env){
  const payload = {
    role: 'admin',
    sub: username,
    exp: Date.now() + (12 * 60 * 60 * 1000),
  };
  const token = await createSignedToken(payload, getSessionSecrets(env).adminSecret);
  return serializeCookie(ADMIN_COOKIE, token, { sameSite: 'Lax', maxAge: 12 * 60 * 60 });
}

export async function createAcquaintanceSession(env){
  const payload = {
    role: 'acquaintance',
    exp: Date.now() + (8 * 60 * 60 * 1000),
  };
  const token = await createSignedToken(payload, getSessionSecrets(env).adminSecret);
  return serializeCookie(ACQUAINTANCE_COOKIE, token, { sameSite: 'Lax', maxAge: 8 * 60 * 60 });
}

export async function getAdminSession(request, env){
  const cookies = parseCookies(request);
  const token = cookies[ADMIN_COOKIE];
  const { adminSecret } = getSessionSecrets(env);
  if(!token || !adminSecret) return null;
  const payload = await verifySignedToken(token, adminSecret);
  if(!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function getAcquaintanceSession(request, env){
  const cookies = parseCookies(request);
  const token = cookies[ACQUAINTANCE_COOKIE];
  const { adminSecret } = getSessionSecrets(env);
  if(!token || !adminSecret) return null;
  const payload = await verifySignedToken(token, adminSecret);
  if(!payload || payload.role !== 'acquaintance') return null;
  return payload;
}

export async function verifyAdminCredentials(username, password, env){
  const { adminUsername, adminPasswordHash } = getSessionSecrets(env);
  if(!adminUsername || !adminPasswordHash) return false;
  if(username !== adminUsername) return false;
  return verifyPassword(password, adminPasswordHash);
}

export async function verifyAcquaintancePassword(password, env){
  const { acquaintancePasswordHash } = getSessionSecrets(env);
  if(!acquaintancePasswordHash) return false;
  return verifyPassword(password, acquaintancePasswordHash);
}

export function adminLogoutCookie(){
  return clearCookie(ADMIN_COOKIE);
}

export function acquaintanceLogoutCookie(){
  return clearCookie(ACQUAINTANCE_COOKIE);
}

export function getAuthConfig(env){
  const secrets = getSessionSecrets(env);
  return {
    hasAdmin: Boolean(secrets.adminSecret && secrets.adminUsername && secrets.adminPasswordHash),
    hasAcquaintance: Boolean(secrets.adminSecret && secrets.acquaintancePasswordHash),
  };
}
