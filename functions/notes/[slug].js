import { getAcquaintanceSession } from '../_lib/auth.js';
import { getPostBySlug } from '../_lib/db.js';
import { html } from '../_lib/http.js';

function escapeHtml(value = ''){
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderLockedPage(slug){
  return `<!DOCTYPE html>
  <html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Private Note</title>
    <link rel="stylesheet" href="/style.css">
    <style>
      body{min-height:100vh;display:grid;place-items:center}
      .note-lock{width:min(640px, calc(100% - 40px));padding:36px;border-radius:28px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 80px rgba(0,0,0,.28)}
      .note-lock .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
    </style>
  </head>
  <body>
    <main class="note-lock">
      <div class="eyebrow">Acquaintance Mode</div>
      <h1 style="font-size:clamp(2rem,4vw,3rem)">This note is available only after acquaintance access.</h1>
      <p class="muted">The requested path <code>${escapeHtml(slug)}</code> is not public. Please return to the homepage and unlock Acquaintance Mode if you have access.</p>
      <div class="actions">
        <a class="btn btn-primary" href="/">Back to home</a>
      </div>
    </main>
  </body>
  </html>`;
}

function renderPostPage(post){
  const postData = JSON.stringify({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    publishedAt: post.publishedAt,
  }).replace(/</g, '\\u003c');

  const robots = post.visibility === 'public' ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
  const title = escapeHtml(post.title.zh || post.title.en);
  const description = escapeHtml(post.excerpt.zh || post.excerpt.en);
  const tags = (post.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

  return `<!DOCTYPE html>
  <html lang="zh-Hant" data-lang="zh">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="${robots}">
    <meta name="description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
    <style>
      .post-shell{padding:140px 0 100px}
      .post-panel{width:min(860px, calc(100% - 40px));margin:0 auto;padding:42px;border-radius:32px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 80px rgba(0,0,0,.28)}
      .post-meta{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
      .post-title{margin:0 0 18px}
      .post-excerpt{font-size:1.05rem;color:#d6cec1;max-width:720px}
      .post-body{margin-top:28px;color:#ddd6c9}
      .post-body p{color:#ddd6c9}
      .post-body h2,.post-body h3{margin-top:36px}
      .post-toolbar{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:28px}
      .post-toolbar .actions{display:flex;gap:12px;flex-wrap:wrap}
      .post-toggle{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--gold-soft);font-weight:600;cursor:pointer}
      @media (max-width:720px){.post-panel{padding:30px 22px}}
    </style>
  </head>
  <body>
    <nav class="nav">
      <div class="nav-inner">
        <a class="brand" href="/" aria-label="Jason Liao home">
          <span class="brand-mark"><span>JL</span></span>
          <span>Jason Liao</span>
        </a>
        <div class="nav-links" style="display:flex">
          <a href="/#writing">Writing</a>
          <a href="/#contact">Contact</a>
        </div>
      </div>
    </nav>

    <main class="post-shell">
      <article class="post-panel">
        <div class="post-toolbar">
          <a class="btn" href="/#writing">← Back</a>
          <div class="actions">
            <button class="post-toggle" id="langSwitch" type="button">EN</button>
          </div>
        </div>
        <div class="post-meta">
          <div class="eyebrow">${post.visibility === 'acquaintance' ? 'Acquaintance Note' : 'Blog / Notes'}</div>
          <div class="small muted">${escapeHtml(post.publishedAt || '')}</div>
        </div>
        <h1 class="post-title">${title}</h1>
        <p class="post-excerpt">${description}</p>
        <div class="tags" id="postTags">${tags}</div>
        <div class="post-body" id="postBody">${post.content.zh || post.content.en || ''}</div>
      </article>
    </main>

    <script>
      const postData = ${postData};
      const langSwitch = document.getElementById('langSwitch');
      const postBody = document.getElementById('postBody');
      const postTags = document.getElementById('postTags');
      const postTitle = document.querySelector('.post-title');
      const postExcerpt = document.querySelector('.post-excerpt');
      let currentLang = 'zh';

      function renderTags(){
        postTags.innerHTML = (postData.tags || []).map(tag => '<span class="tag">' + tag + '</span>').join('');
      }

      function renderPost(lang){
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
        document.documentElement.dataset.lang = lang;
        langSwitch.textContent = lang === 'zh' ? 'EN' : '中文';
        postTitle.textContent = postData.title[lang] || postData.title.zh || postData.title.en || '';
        postExcerpt.textContent = postData.excerpt[lang] || postData.excerpt.zh || postData.excerpt.en || '';
        postBody.innerHTML = postData.content[lang] || postData.content.zh || postData.content.en || '';
        renderTags();
      }

      langSwitch.addEventListener('click', () => renderPost(currentLang === 'zh' ? 'en' : 'zh'));
      renderPost('zh');
    </script>
  </body>
  </html>`;
}

export async function onRequestGet(context){
  const { slug } = context.params;
  const post = await getPostBySlug(context.env, slug);
  if(!post){
    return new Response('Not Found', { status: 404 });
  }

  if(post.status !== 'published'){
    return new Response('Not Found', { status: 404 });
  }

  if(post.visibility === 'acquaintance'){
    const session = await getAcquaintanceSession(context.request, context.env);
    if(!session){
      return html(renderLockedPage(slug), {
        status: 404,
        headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      });
    }
  }

  return html(renderPostPage(post), {
    headers: post.visibility === 'acquaintance'
      ? { 'X-Robots-Tag': 'noindex, nofollow' }
      : {},
  });
}
