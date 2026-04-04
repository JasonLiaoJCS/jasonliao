import { getAdminSession } from '../../_lib/auth.js';
import { setDocument } from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestPut(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { profile } = await context.request.json().catch(() => ({}));
  if(!profile || typeof profile !== 'object'){
    return badRequest('Profile payload is required');
  }

  try {
    await setDocument(context.env, 'private_profile', profile);
    return json({ ok: true, profile });
  } catch (error){
    return serverError(error.message);
  }
}
