import { getAcquaintanceSession } from '../../_lib/auth.js';
import { json } from '../../_lib/http.js';

export async function onRequestGet(context){
  const session = await getAcquaintanceSession(context.request, context.env);
  return json({
    ok: true,
    authenticated: Boolean(session),
  });
}
