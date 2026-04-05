import { getAdminSession } from '../../_lib/auth.js';
import {
  getPrivateProfileDefault,
  setPrivateProfileDefault,
} from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

function normalizePrivateProfileImage(image = {}){
  const dataUrl = String(image?.dataUrl || '').trim();
  return {
    dataUrl,
    alt: {
      zh: dataUrl ? String(image?.alt?.zh || 'Portrait').trim() : 'Portrait',
      en: dataUrl ? String(image?.alt?.en || 'Portrait').trim() : 'Portrait',
    },
    caption: {
      zh: dataUrl ? String(image?.caption?.zh || '').trim() : '',
      en: dataUrl ? String(image?.caption?.en || '').trim() : '',
    },
  };
}

function normalizePrivateProfile(profile = {}){
  return {
    ...profile,
    images: {
      primary: normalizePrivateProfileImage(profile.images?.primary),
      secondary: normalizePrivateProfileImage(profile.images?.secondary),
    },
  };
}

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
    const normalizedProfile = normalizePrivateProfile(profile);
    await setPrivateProfileDefault(context.env, normalizedProfile);
    return json({ ok: true, profile: normalizedProfile });
  } catch (error){
    return serverError(error.message);
  }
}
