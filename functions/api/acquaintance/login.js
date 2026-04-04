import { createAcquaintanceSession, verifyAcquaintancePassword } from '../../_lib/auth.js';
import { badRequest, json, unauthorized } from '../../_lib/http.js';

export async function onRequestPost(context){
  const { password } = await context.request.json().catch(() => ({}));
  if(!password){
    return badRequest('Password is required');
  }

  const valid = await verifyAcquaintancePassword(password, context.env);
  if(!valid){
    return unauthorized('Invalid password');
  }

  const response = json({ ok: true });
  response.headers.append('Set-Cookie', await createAcquaintanceSession(context.env));
  return response;
}
