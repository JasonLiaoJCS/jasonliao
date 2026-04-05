import { getAdminSession } from '../../../_lib/auth.js';
import { badRequest, json, serverError, unauthorized } from '../../../_lib/http.js';
import { setFeaturedPost } from '../../../_lib/db.js';

export async function onRequestPost(context){
  const session = await getAdminSession(context.request, context.env);
  if(!session){
    return unauthorized('Admin session required');
  }

  const { id } = await context.request.json().catch(() => ({}));
  if(!id){
    return badRequest('Post id is required');
  }

  try {
    const result = await setFeaturedPost(context.env, id, 'manual');
    return json({
      ok: true,
      featuredPostId: result.settings.featuredPostId,
      featuredSource: result.settings.source,
      post: result.post,
    });
  } catch (error){
    if(error.message === 'Post not found' || error.message === 'Only published posts can be featured'){
      return badRequest(error.message);
    }
    return serverError(error.message);
  }
}
