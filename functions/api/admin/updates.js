import { getAdminSession } from '../../_lib/auth.js';
import { replaceUpdates } from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestPut(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { updates } = await context.request.json().catch(() => ({}));
  if(!Array.isArray(updates)){
    return badRequest('Updates payload must be an array');
  }

  try {
    await replaceUpdates(context.env, updates);
    return json({ ok: true, updates });
  } catch (error){
    return serverError(error.message);
  }
}
