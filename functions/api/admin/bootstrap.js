import { getAdminSession } from '../../_lib/auth.js';
import { getAdminBootstrap } from '../../_lib/db.js';
import { json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestGet(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  try {
    const data = await getAdminBootstrap(context.env);
    return json({
      ok: true,
      username: session.sub,
      ...data,
    });
  } catch (error){
    return serverError(error.message);
  }
}
