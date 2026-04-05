import { getAdminSession } from '../../_lib/auth.js';
import { deletePost, upsertPost } from '../../_lib/db.js';
import { badRequest, json, serverError, unauthorized } from '../../_lib/http.js';

const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function onRequestPost(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { post } = await context.request.json().catch(() => ({}));
  if(!post?.id || !post?.slug){
    return badRequest('Post id and slug are required');
  }
  if(!POST_SLUG_PATTERN.test(String(post.slug || '').trim())){
    return badRequest('Slug must use lowercase letters, numbers, and hyphens only');
  }

  try {
    const savedPost = await upsertPost(context.env, post);
    return json({ ok: true, post: savedPost });
  } catch (error){
    if(String(error.message || '').includes('UNIQUE')){
      return badRequest('Slug already exists');
    }
    return serverError(error.message);
  }
}

export async function onRequestDelete(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { id } = await context.request.json().catch(() => ({}));
  if(!id){
    return badRequest('Post id is required');
  }

  try {
    await deletePost(context.env, id);
    return json({ ok: true });
  } catch (error){
    return serverError(error.message);
  }
}
