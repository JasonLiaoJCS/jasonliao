import { getAuthConfig } from '../../_lib/auth.js';
import { getPublicBootstrap } from '../../_lib/db.js';
import { json, serverError } from '../../_lib/http.js';

export async function onRequestGet(context){
  try {
    const data = await getPublicBootstrap(context.env);
    const auth = getAuthConfig(context.env);

    return json({
      ok: true,
      backendEnabled: true,
      serverAcquaintanceEnabled: auth.hasAcquaintance,
      ...data,
    });
  } catch (error){
    return serverError(error.message);
  }
}
