export function json(data, init = {}){
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function html(markup, init = {}){
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(markup, {
    ...init,
    headers,
  });
}

export function unauthorized(message = 'Unauthorized'){
  return json({ ok: false, error: message }, { status: 401 });
}

export function badRequest(message = 'Bad request'){
  return json({ ok: false, error: message }, { status: 400 });
}

export function serverError(message = 'Server error'){
  return json({ ok: false, error: message }, { status: 500 });
}
