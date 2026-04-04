import { getAdminSession } from '../../_lib/auth.js';
import {
  DEFAULT_PRIVATE_PROFILE,
  DEFAULT_PUBLIC_TRANSLATIONS,
  DEFAULT_UPDATES,
} from '../../_lib/default-cms-content.js';
import {
  deleteAllPosts,
  replaceUpdates,
  setDocument,
} from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

async function resetTranslations(env){
  await setDocument(env, 'public_translations', DEFAULT_PUBLIC_TRANSLATIONS);
  return { translations: DEFAULT_PUBLIC_TRANSLATIONS };
}

async function resetUpdates(env){
  await replaceUpdates(env, DEFAULT_UPDATES);
  return { updates: DEFAULT_UPDATES };
}

async function resetPrivateProfile(env){
  await setDocument(env, 'private_profile', DEFAULT_PRIVATE_PROFILE);
  return { profile: DEFAULT_PRIVATE_PROFILE };
}

async function resetAll(env){
  await setDocument(env, 'public_translations', DEFAULT_PUBLIC_TRANSLATIONS);
  await replaceUpdates(env, DEFAULT_UPDATES);
  await setDocument(env, 'private_profile', DEFAULT_PRIVATE_PROFILE);
  await deleteAllPosts(env);
  return {
    translations: DEFAULT_PUBLIC_TRANSLATIONS,
    updates: DEFAULT_UPDATES,
    profile: DEFAULT_PRIVATE_PROFILE,
    posts: [],
  };
}

export async function onRequestPost(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { target } = await context.request.json().catch(() => ({}));
  if(!target){
    return badRequest('Reset target is required');
  }

  try {
    if(target === 'translations'){
      return json({ ok: true, target, ...(await resetTranslations(context.env)) });
    }
    if(target === 'updates'){
      return json({ ok: true, target, ...(await resetUpdates(context.env)) });
    }
    if(target === 'private-profile'){
      return json({ ok: true, target, ...(await resetPrivateProfile(context.env)) });
    }
    if(target === 'all'){
      return json({ ok: true, target, ...(await resetAll(context.env)) });
    }
    return badRequest('Unsupported reset target');
  } catch (error){
    return serverError(error.message);
  }
}
