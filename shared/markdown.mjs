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

function sanitizeUrl(value = ''){
  const trimmed = String(value).trim();
  if(!trimmed){
    return '';
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

function renderInlineMarkdown(value = ''){
  const tokens = [];
  let html = escapeHtml(value);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
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

function flushParagraph(blocks, paragraphLines){
  if(!paragraphLines.length){
    return;
  }
  const content = paragraphLines
    .map(line => renderInlineMarkdown(line.trim()))
    .join('<br>');
  blocks.push(`<p>${content}</p>`);
  paragraphLines.length = 0;
}

function flushQuote(blocks, quoteLines){
  if(!quoteLines.length){
    return;
  }
  const content = quoteLines
    .map(line => `<p>${renderInlineMarkdown(line.trim())}</p>`)
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
  const input = String(markdown).replace(/\r\n?/g, '\n');
  if(!input.trim()){
    return '';
  }

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
      flushParagraph(blocks, paragraphLines);
      flushQuote(blocks, quoteLines);
      listState = flushList(blocks, listState);
      inFence = true;
      fenceLang = trimmed.slice(3).trim().replace(/[^\w-]/g, '');
      continue;
    }

    if(!trimmed){
      flushParagraph(blocks, paragraphLines);
      flushQuote(blocks, quoteLines);
      listState = flushList(blocks, listState);
      continue;
    }

    if(/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(trimmed)){
      flushParagraph(blocks, paragraphLines);
      flushQuote(blocks, quoteLines);
      listState = flushList(blocks, listState);
      blocks.push('<hr>');
      continue;
    }

    const heading = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if(heading){
      flushParagraph(blocks, paragraphLines);
      flushQuote(blocks, quoteLines);
      listState = flushList(blocks, listState);
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2].trim())}</h${level}>`);
      continue;
    }

    const quote = rawLine.match(/^>\s?(.*)$/);
    if(quote){
      flushParagraph(blocks, paragraphLines);
      listState = flushList(blocks, listState);
      quoteLines.push(quote[1]);
      continue;
    }
    flushQuote(blocks, quoteLines);

    const ordered = rawLine.match(/^\d+\.\s+(.*)$/);
    const unordered = rawLine.match(/^[-*]\s+(.*)$/);
    if(ordered || unordered){
      flushParagraph(blocks, paragraphLines);
      const nextType = ordered ? 'ol' : 'ul';
      if(!listState || listState.type !== nextType){
        listState = flushList(blocks, listState);
        listState = { type: nextType, items: [] };
      }
      listState.items.push(renderInlineMarkdown((ordered?.[1] || unordered?.[1] || '').trim()));
      continue;
    }
    listState = flushList(blocks, listState);

    paragraphLines.push(rawLine);
  }

  if(inFence){
    const langAttr = fenceLang ? ` class="language-${escapeAttribute(fenceLang)}"` : '';
    blocks.push(`<pre><code${langAttr}>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
  }

  flushParagraph(blocks, paragraphLines);
  flushQuote(blocks, quoteLines);
  flushList(blocks, listState);

  return blocks.join('\n');
}

function renderRichContent(value = ''){
  const input = String(value ?? '');
  if(!input.trim()){
    return '';
  }
  if(isLikelyHtml(input)){
    return input;
  }
  return renderMarkdownToHtml(input);
}

export {
  escapeHtml,
  isLikelyHtml,
  renderMarkdownToHtml,
  renderRichContent,
  sanitizeUrl,
};
