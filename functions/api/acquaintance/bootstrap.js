import { getAcquaintanceSession } from '../../_lib/auth.js';
import { getAcquaintanceBootstrap } from '../../_lib/db.js';
import { json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestGet(context){
  const session = await getAcquaintanceSession(context.request, context.env);
  if(!session){
    return unauthorized('Acquaintance session required');
  }

  try {
    const data = await getAcquaintanceBootstrap(context.env);
    return json({ ok: true, ...data });
  } catch (error){
    return serverError(error.message);
  }
}
