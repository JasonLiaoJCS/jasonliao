function escapeHtml(value = ''){
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value = ''){
  return escapeHtml(value);
}

const EMBEDDED_IMAGE_TOKEN_PREFIX = 'jl-img:';
const EMBEDDED_IMAGE_BLOCK_LANG = 'jl-images';

function isSafeDataImageUrl(value = ''){
  const trimmed = String(value).trim();
  if(!trimmed){
    return false;
  }
  return /^data:image\/(?:png|jpe?g);base64,[a-z0-9+/=]+$/i.test(trimmed);
}

function normalizeEmbeddedImageEntry(entry){
  if(typeof entry === 'string' && isSafeDataImageUrl(entry)){
    return { src: entry };
  }
  if(entry && typeof entry === 'object' && isSafeDataImageUrl(entry.src)){
    return { src: String(entry.src).trim() };
  }
  return null;
}

function normalizeEmbeddedImageManifest(manifest = {}){
  const normalized = {};
  Object.entries(manifest || {}).forEach(([id, entry]) => {
    const cleanId = String(id || '').trim();
    const cleanEntry = normalizeEmbeddedImageEntry(entry);
    if(cleanId && cleanEntry){
      normalized[cleanId] = cleanEntry;
    }
  });
  return normalized;
}

function createEmbeddedImageToken(id = ''){
  return `${EMBEDDED_IMAGE_TOKEN_PREFIX}${String(id || '').trim()}`;
}

function resolveEmbeddedImageUrl(value = '', manifest = {}){
  const trimmed = String(value).trim();
  if(!trimmed.toLowerCase().startsWith(EMBEDDED_IMAGE_TOKEN_PREFIX)){
    return '';
  }
  const id = trimmed.slice(EMBEDDED_IMAGE_TOKEN_PREFIX.length).trim();
  if(!id){
    return '';
  }
  return normalizeEmbeddedImageEntry(manifest[id])?.src || '';
}

function createUniqueEmbeddedImageId(manifest = {}, prefix = 'img'){
  let index = Object.keys(manifest).length + 1;
  let candidate = `${prefix}-${index}`;
  while(manifest[candidate]){
    index += 1;
    candidate = `${prefix}-${index}`;
  }
  return candidate;
}

function extractEmbeddedImageDocument(markdown = ''){
  const input = String(markdown ?? '').replace(/\r\n?/g, '\n');
  const manifest = {};
  const stripped = input.replace(/(?:^|\n)```jl-images\s*\n([\s\S]*?)\n```[ \t]*(?=\n|$)/g, (match, jsonText) => {
    try {
      Object.assign(manifest, normalizeEmbeddedImageManifest(JSON.parse(jsonText)));
    } catch {
      // Ignore malformed embedded-image blocks and leave them stripped from render output.
    }
    return '\n';
  });

  const migrated = stripped.replace(/!\[([^\]]*)\]\((data:image\/(?:png|jpe?g);base64,[^)]+)\)/gi, (match, alt, url) => {
    const safeUrl = String(url || '').trim();
    if(!isSafeDataImageUrl(safeUrl)){
      return match;
    }
    const id = createUniqueEmbeddedImageId(manifest, 'migrated');
    manifest[id] = { src: safeUrl };
    return `![${alt}](${createEmbeddedImageToken(id)})`;
  });

  return {
    content: migrated.trimEnd(),
    manifest: normalizeEmbeddedImageManifest(manifest),
  };
}

function serializeEmbeddedImageDocument(markdown = '', manifest = {}){
  const extracted = extractEmbeddedImageDocument(markdown);
  const content = extracted.content.trimEnd();
  const availableManifest = normalizeEmbeddedImageManifest({
    ...manifest,
    ...extracted.manifest,
  });
  const usedManifest = {};

  content.replace(/!\[[^\]]*\]\((jl-img:[^)]+)\)/gi, (match, token) => {
    const id = String(token).trim().slice(EMBEDDED_IMAGE_TOKEN_PREFIX.length);
    if(id && availableManifest[id]){
      usedManifest[id] = availableManifest[id];
    }
    return match;
  });

  if(!Object.keys(usedManifest).length){
    return content;
  }

  const payload = JSON.stringify(usedManifest);
  return `${content}${content ? '\n\n' : ''}\`\`\`${EMBEDDED_IMAGE_BLOCK_LANG}\n${payload}\n\`\`\``;
}

function sanitizeUrl(value = '', options = {}){
  const trimmed = String(value).trim();
  if(!trimmed){
    return '';
  }
  if(options.allowDataImage && isSafeDataImageUrl(trimmed)){
    return trimmed;
  }
  if(/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)){
    return trimmed;
  }
  return '';
}

function isLikelyHtml(value = ''){
  const trimmed = String(value).trim();
  if(!trimmed){
    return false;
  }
  return /<\/?[a-z][\w-]*(?:\s[^>]*)?>/i.test(trimmed);
}

function stashToken(tokens, html){
  const key = `\u0000JLMD${tokens.length}\u0000`;
  tokens.push({ key, html });
  return key;
}

function restoreTokens(text, tokens){
  return tokens.reduce((output, token) => output.replaceAll(token.key, token.html), text);
}

function renderInlineMarkdown(value = '', manifest = {}){
  const tokens = [];
  let html = escapeHtml(value);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const embeddedUrl = resolveEmbeddedImageUrl(url, manifest);
    const safeUrl = embeddedUrl || sanitizeUrl(url, { allowDataImage: true });
    if(!safeUrl){
      return match;
    }
    return stashToken(
      tokens,
      `<img src="${escapeAttribute(safeUrl)}" alt="${escapeAttribute(alt)}" loading="lazy">`,
    );
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const safeUrl = sanitizeUrl(url);
    if(!safeUrl){
      return match;
    }
    const external = /^(https?:)?\/\//i.test(safeUrl);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return stashToken(
      tokens,
      `<a href="${escapeAttribute(safeUrl)}"${attrs}>${label}</a>`,
    );
  });

  html = html.replace(/`([^`]+)`/g, (_, code) => stashToken(tokens, `<code>${code}</code>`));
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>');
  html = html.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
  html = html.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');
  html = html.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');

  return restoreTokens(html, tokens);
}

function flushParagraph(blocks, paragraphLines, renderInline){
  if(!paragraphLines.length){
    return;
  }
  const content = paragraphLines
    .map(line => renderInline(line.trim()))
    .join('<br>');
  blocks.push(`<p>${content}</p>`);
  paragraphLines.length = 0;
}

function flushQuote(blocks, quoteLines, renderInline){
  if(!quoteLines.length){
    return;
  }
  const content = quoteLines
    .map(line => `<p>${renderInline(line.trim())}</p>`)
    .join('');
  blocks.push(`<blockquote>${content}</blockquote>`);
  quoteLines.length = 0;
}

function flushList(blocks, listState){
  if(!listState){
    return null;
  }
  const tag = listState.type === 'ol' ? 'ol' : 'ul';
  blocks.push(`<${tag}>${listState.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`);
  return null;
}

function renderMarkdownToHtml(markdown = ''){
  const extracted = extractEmbeddedImageDocument(markdown);
  const input = extracted.content;
  if(!input.trim()){
    return '';
  }

  const renderInline = value => renderInlineMarkdown(value, extracted.manifest);
  const blocks = [];
  const lines = input.split('\n');
  const paragraphLines = [];
  const quoteLines = [];
  let listState = null;
  let inFence = false;
  let fenceLang = '';
  let fenceLines = [];

  for(const rawLine of lines){
    const trimmed = rawLine.trim();

    if(inFence){
      if(/^```/.test(trimmed)){
        const langAttr = fenceLang ? ` class="language-${escapeAttribute(fenceLang)}"` : '';
        blocks.push(`<pre><code${langAttr}>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
        inFence = false;
        fenceLang = '';
        fenceLines = [];
      } else {
        fenceLines.push(rawLine);
      }
      continue;
    }

    if(/^```/.test(trimmed)){
      flushParagraph(blocks, paragraphLines, renderInline);
      flushQuote(blocks, quoteLines, renderInline);
      listState = flushList(blocks, listState);
      inFence = true;
      fenceLang = trimmed.slice(3).trim().replace(/[^\w-]/g, '');
      continue;
    }

    if(!trimmed){
      flushParagraph(blocks, paragraphLines, renderInline);
      flushQuote(blocks, quoteLines, renderInline);
      listState = flushList(blocks, listState);
      continue;
    }

    if(/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(trimmed)){
      flushParagraph(blocks, paragraphLines, renderInline);
      flushQuote(blocks, quoteLines, renderInline);
      listState = flushList(blocks, listState);
      blocks.push('<hr>');
      continue;
    }

    const heading = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if(heading){
      flushParagraph(blocks, paragraphLines, renderInline);
      flushQuote(blocks, quoteLines, renderInline);
      listState = flushList(blocks, listState);
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      continue;
    }

    const quote = rawLine.match(/^>\s?(.*)$/);
    if(quote){
      flushParagraph(blocks, paragraphLines, renderInline);
      listState = flushList(blocks, listState);
      quoteLines.push(quote[1]);
      continue;
    }
    flushQuote(blocks, quoteLines, renderInline);

    const ordered = rawLine.match(/^\d+\.\s+(.*)$/);
    const unordered = rawLine.match(/^[-*]\s+(.*)$/);
    if(ordered || unordered){
      flushParagraph(blocks, paragraphLines, renderInline);
      const nextType = ordered ? 'ol' : 'ul';
      if(!listState || listState.type !== nextType){
        listState = flushList(blocks, listState);
        listState = { type: nextType, items: [] };
      }
      listState.items.push(renderInline((ordered?.[1] || unordered?.[1] || '').trim()));
      continue;
    }
    listState = flushList(blocks, listState);

    paragraphLines.push(rawLine);
  }

  if(inFence){
    const langAttr = fenceLang ? ` class="language-${escapeAttribute(fenceLang)}"` : '';
    blocks.push(`<pre><code${langAttr}>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
  }

  flushParagraph(blocks, paragraphLines, renderInline);
  flushQuote(blocks, quoteLines, renderInline);
  flushList(blocks, listState);

  return blocks.join('\n');
}

function renderRichContent(value = ''){
  const extracted = extractEmbeddedImageDocument(value);
  const input = extracted.content;
  if(!input.trim()){
    return '';
  }
  if(isLikelyHtml(input)){
    return input;
  }
  return renderMarkdownToHtml(value);
}

export {
  createEmbeddedImageToken,
  escapeHtml,
  extractEmbeddedImageDocument,
  isLikelyHtml,
  isSafeDataImageUrl,
  renderMarkdownToHtml,
  renderRichContent,
  sanitizeUrl,
  serializeEmbeddedImageDocument,
};
