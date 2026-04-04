import { createAdminSession, verifyAdminCredentials } from '../../_lib/auth.js';
import { badRequest, json, unauthorized } from '../../_lib/http.js';

export async function onRequestPost(context){
  const { username, password } = await context.request.json().catch(() => ({}));
  if(!username || !password){
    return badRequest('Username and password are required');
  }

  const valid = await verifyAdminCredentials(username, password, context.env);
  if(!valid){
    return unauthorized('Invalid credentials');
  }

  const response = json({ ok: true });
  response.headers.append('Set-Cookie', await createAdminSession(username, context.env));
  return response;
}
