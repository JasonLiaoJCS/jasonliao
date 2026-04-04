import { getAdminSession } from '../../_lib/auth.js';
import { getDocument, setDocument } from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

export async function onRequestPut(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { translations } = await context.request.json().catch(() => ({}));
  if(!translations || typeof translations !== 'object'){
    return badRequest('Translations payload is required');
  }

  try {
    const current = await getDocument(context.env, 'public_translations', { zh: {}, en: {} });
    const nextValue = {
      zh: { ...(current?.zh || {}), ...(translations.zh || {}) },
      en: { ...(current?.en || {}), ...(translations.en || {}) },
    };
    await setDocument(context.env, 'public_translations', nextValue);
    return json({ ok: true, translations: nextValue });
  } catch (error){
    return serverError(error.message);
  }
}
