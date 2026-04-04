import { getAdminSession } from '../../_lib/auth.js';
import {
  getPrivateProfileDefault,
  setPrivateProfileDefault,
} from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestGet(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  try {
    const profile = await getPrivateProfileDefault(context.env);
    return json({ ok: true, profile });
  } catch (error){
    return serverError(error.message);
  }
}

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
    await setPrivateProfileDefault(context.env, profile);
    return json({ ok: true, profile });
  } catch (error){
    return serverError(error.message);
  }
}
