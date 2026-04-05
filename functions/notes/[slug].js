import { getAcquaintanceSession } from '../_lib/auth.js';
import { getPostBySlug } from '../_lib/db.js';
import { html } from '../_lib/http.js';
import { escapeHtml, renderRichContent } from '../../shared/markdown.mjs';

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

function stripRichText(value = ''){
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, ' $1 ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingMinutes(post){
  const sample = stripRichText(post.content.zh || post.content.en || '');
  if(!sample){
    return 1;
  }
  const latinWords = (sample.match(/[A-Za-z0-9_]+/g) || []).length;
  const cjkChars = (sample.match(/[\u3400-\u9fff]/g) || []).length;
  const wordEquivalent = latinWords + (cjkChars / 2);
  return Math.max(1, Math.round(wordEquivalent / 220));
}

function renderPostPage(post){
  const renderedContent = {
    zh: renderRichContent(post.content.zh || ''),
    en: renderRichContent(post.content.en || ''),
  };
  const readingMinutes = estimateReadingMinutes(post);
  const coverImageSrc = String(post.coverImage?.src || '').trim();
  const publicCoverImage = coverImageSrc && !coverImageSrc.startsWith('data:') ? coverImageSrc : '';

  const postData = JSON.stringify({
    title: post.title,
    excerpt: post.excerpt,
    renderedContent,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readingMinutes,
    coverImage: post.coverImage || {},
  }).replace(/</g, '\\u003c');

  const robots = post.visibility === 'public' ? 'index,follow,max-image-preview:large' : 'noindex,nofollow';
  const title = escapeHtml(post.title.zh || post.title.en);
  const description = escapeHtml(post.excerpt.zh || post.excerpt.en);
  const tags = (post.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const coverImageAlt = escapeHtml(post.coverImage?.alt?.zh || post.coverImage?.alt?.en || title);
  const coverMarkup = coverImageSrc
    ? `<div class="post-cover"><img src="${escapeHtml(coverImageSrc)}" alt="${coverImageAlt}"></div>`
    : '';

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
    ${publicCoverImage ? `<meta property="og:image" content="${escapeHtml(publicCoverImage)}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    ${publicCoverImage ? `<meta name="twitter:image" content="${escapeHtml(publicCoverImage)}">` : ''}
    <title>${title}</title>
    <link rel="stylesheet" href="/style.css">
    <style>
      .post-shell{padding:132px 0 110px}
      .post-hero,.post-panel{width:min(960px, calc(100% - 40px));margin:0 auto}
      .post-hero{
        position:relative;
        overflow:hidden;
        display:grid;
        gap:20px;
        padding:38px 40px;
        border-radius:34px;
        border:1px solid rgba(255,255,255,.1);
        background:
          radial-gradient(circle at 82% 18%, rgba(217,177,111,.16), transparent 24%),
          linear-gradient(160deg, rgba(17,21,31,.96), rgba(8,10,16,.985));
        box-shadow:
          0 28px 82px rgba(0,0,0,.28),
          inset 0 1px 0 rgba(255,255,255,.05);
      }
      .post-hero::before{
        content:"";
        position:absolute;
        inset:16px;
        border-radius:26px;
        border:1px solid rgba(255,255,255,.06);
        background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.008));
        pointer-events:none;
      }
      .post-hero > *{position:relative;z-index:1}
      .post-toolbar{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
      .post-toolbar .actions{display:flex;gap:12px;flex-wrap:wrap}
      .post-toggle{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--gold-soft);font-weight:600;cursor:pointer}
      .post-meta{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start}
      .post-meta-cluster{display:flex;gap:10px;flex-wrap:wrap}
      .post-chip{
        display:inline-flex;
        align-items:center;
        padding:8px 12px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#e7decf;
        font-size:.85rem;
      }
      .post-title{margin:0;font-size:clamp(2.5rem, 5vw, 4.4rem);line-height:.95;letter-spacing:-.03em;max-width:12ch}
      .post-excerpt{margin:0;font-size:1.08rem;color:#d6cec1;max-width:64ch;line-height:1.85}
      .post-cover img{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:28px;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 48px rgba(0,0,0,.22)}
      .post-panel{
        margin-top:24px;
        padding:42px;
        border-radius:32px;
        background:rgba(255,255,255,.045);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 24px 80px rgba(0,0,0,.28)
      }
      .post-body-wrap{max-width:70ch}
      .post-body{color:#ddd6c9}
      .post-body p{color:#ddd6c9;margin:0 0 18px}
      .post-body h2,.post-body h3,.post-body h4{margin:36px 0 16px}
      .post-body ul,.post-body ol{padding-left:1.3rem;margin:0 0 18px}
      .post-body li + li{margin-top:8px}
      .post-body blockquote{margin:24px 0;padding:18px 20px;border-left:3px solid rgba(217,177,111,.48);background:rgba(217,177,111,.08);border-radius:0 18px 18px 0}
      .post-body pre{overflow:auto;margin:24px 0;padding:18px;border-radius:22px;background:#0e131d;border:1px solid rgba(255,255,255,.08)}
      .post-body code{padding:2px 6px;border-radius:8px;background:rgba(255,255,255,.08);font-family:"IBM Plex Mono","SFMono-Regular",Consolas,monospace;font-size:.92em}
      .post-body pre code{padding:0;background:none}
      .post-body hr{border:none;height:1px;margin:32px 0;background:rgba(255,255,255,.12)}
      .post-body a{color:var(--gold-soft);text-decoration:underline;text-underline-offset:3px}
      .post-body img{display:block;max-width:100%;height:auto;margin:22px 0;border-radius:22px;border:1px solid rgba(255,255,255,.08)}
      @media (max-width:720px){
        .post-hero,.post-panel{width:min(100%, calc(100% - 24px))}
        .post-hero,.post-panel{padding:28px 22px}
        .post-title{max-width:none}
      }
    </style>
  </head>
  <body>
    <nav class="nav">
      <div class="nav-inner">
        <a class="brand" href="/" aria-label="Jason Liao home">
          <span class="brand-mark"><span>JL</span></span>
          <span>Jason Liao</span>
        </a>
        <button class="menu-btn" id="postMenuBtn" type="button" aria-label="Toggle menu" aria-expanded="false">☰</button>
        <div class="nav-links" id="postNavLinks">
          <a href="/#writing">Writing</a>
          <a href="/#contact">Contact</a>
        </div>
      </div>
    </nav>

    <main class="post-shell">
      <section class="post-hero">
        <div class="post-toolbar">
          <a class="btn" href="/#writing">← Back</a>
          <div class="actions">
            <button class="post-toggle" id="langSwitch" type="button">EN</button>
          </div>
        </div>
        <div class="post-meta">
          <div class="eyebrow">${post.visibility === 'acquaintance' ? 'Acquaintance Note' : 'Blog / Notes'}</div>
          <div class="post-meta-cluster">
            <span class="post-chip" id="postPublished">${escapeHtml(post.publishedAt || '')}</span>
            <span class="post-chip" id="postReadingTime">${readingMinutes} min read</span>
          </div>
        </div>
        ${coverMarkup}
        <h1 class="post-title">${title}</h1>
        <p class="post-excerpt">${description}</p>
        <div class="tags" id="postTags">${tags}</div>
      </section>

      <article class="post-panel">
        <div class="post-body-wrap">
          <div class="post-body" id="postBody">${renderedContent.zh || renderedContent.en || ''}</div>
        </div>
      </article>
    </main>

    <script>
      const postData = ${postData};
      const langSwitch = document.getElementById('langSwitch');
      const postBody = document.getElementById('postBody');
      const postTags = document.getElementById('postTags');
      const postTitle = document.querySelector('.post-title');
      const postExcerpt = document.querySelector('.post-excerpt');
      const postPublished = document.getElementById('postPublished');
      const postReadingTime = document.getElementById('postReadingTime');
      const postMenuBtn = document.getElementById('postMenuBtn');
      const postNavLinks = document.getElementById('postNavLinks');
      let currentLang = 'zh';
      const escapeHtml = value => String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

      function renderTags(){
        postTags.innerHTML = (postData.tags || []).map(tag => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
      }

      function renderPost(lang){
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
        document.documentElement.dataset.lang = lang;
        langSwitch.textContent = lang === 'zh' ? 'EN' : '中文';
        postTitle.textContent = postData.title[lang] || postData.title.zh || postData.title.en || '';
        postExcerpt.textContent = postData.excerpt[lang] || postData.excerpt.zh || postData.excerpt.en || '';
        postBody.innerHTML = postData.renderedContent[lang] || postData.renderedContent.zh || postData.renderedContent.en || '';
        postPublished.textContent = postData.publishedAt || '';
        postReadingTime.textContent = lang === 'zh'
          ? '閱讀約 ' + postData.readingMinutes + ' 分鐘'
          : postData.readingMinutes + ' min read';
        renderTags();
      }

      if (postMenuBtn && postNavLinks) {
        const closeMenu = () => {
          postNavLinks.classList.remove('open');
          postMenuBtn.setAttribute('aria-expanded', 'false');
        };

        postMenuBtn.addEventListener('click', () => {
          const isOpen = postNavLinks.classList.toggle('open');
          postMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        postNavLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', event => {
          if (!postNavLinks.classList.contains('open')) {
            return;
          }
          if (postNavLinks.contains(event.target) || postMenuBtn.contains(event.target)) {
            return;
          }
          closeMenu();
        });

        document.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            closeMenu();
          }
        });

        window.addEventListener('resize', () => {
          if (window.innerWidth > 760) {
            closeMenu();
          }
        });
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
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  return html(renderPostPage(post), {
    headers: post.visibility === 'acquaintance'
      ? {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      }
      : {},
  });
}
