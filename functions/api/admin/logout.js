import { adminLogoutCookie } from '../../_lib/auth.js';
import { json } from '../../_lib/http.js';

export async function onRequestPost(){
  const response = json({ ok: true });
  response.headers.append('Set-Cookie', adminLogoutCookie());
  return response;
}
