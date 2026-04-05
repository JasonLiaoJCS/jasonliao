import {
  DEFAULT_POSTS,
  DEFAULT_PRIVATE_PROFILE,
  DEFAULT_PUBLIC_TRANSLATIONS,
  DEFAULT_UPDATES,
  PRIVATE_PROFILE_TRANSLATION_GROUPS,
  TRANSLATION_FIELD_GROUPS,
} from './default-cms-content.js';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS cms_documents (
    id TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cms_updates (
    id TEXT PRIMARY KEY,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'acquaintance')),
    is_published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    date_label TEXT NOT NULL,
    zh_text TEXT NOT NULL,
    en_text TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cms_posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'acquaintance')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    published_at TEXT,
    updated_at TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    title_en TEXT NOT NULL,
    excerpt_zh TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    content_zh TEXT NOT NULL,
    content_en TEXT NOT NULL,
    tags_json TEXT NOT NULL DEFAULT '[]',
    cover_image_json TEXT NOT NULL DEFAULT '{}'
  )`,
];

let ensurePromise;

function nowIso(){
  return new Date().toISOString();
}

function parseJson(text, fallback){
  if(!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function ensureOptionalColumn(env, tableName, columnName, definition){
  try {
    await env.CMS_DB.prepare(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`,
    ).run();
  } catch (error){
    const message = String(error?.message || '');
    if(
      message.includes('duplicate column name') ||
      message.includes(`duplicate column name: ${columnName}`) ||
      message.includes('already exists')
    ){
      return;
    }
    throw error;
  }
}

function normalizeCoverImage(coverImage = {}){
  const src = String(coverImage?.src || '').trim();
  return {
    src,
    alt: {
      zh: src ? String(coverImage?.alt?.zh || '').trim() : '',
      en: src ? String(coverImage?.alt?.en || '').trim() : '',
    },
  };
}

export async function ensureCmsDb(env){
  if(!env.CMS_DB){
    throw new Error('CMS_DB binding is missing');
  }

  if(!ensurePromise){
    ensurePromise = (async () => {
      for(const statement of SCHEMA_STATEMENTS){
        await env.CMS_DB.prepare(statement).run();
      }
      await ensureOptionalColumn(env, 'cms_posts', 'cover_image_json', "TEXT NOT NULL DEFAULT '{}'");
      await env.CMS_DB.prepare(
        'INSERT OR IGNORE INTO cms_documents (id, value_json, updated_at) VALUES (?, ?, ?)',
      ).bind(
        'public_translations',
        JSON.stringify(DEFAULT_PUBLIC_TRANSLATIONS),
        nowIso(),
      ).run();
      await env.CMS_DB.prepare(
        'INSERT OR IGNORE INTO cms_documents (id, value_json, updated_at) VALUES (?, ?, ?)',
      ).bind(
        'private_profile',
        JSON.stringify(DEFAULT_PRIVATE_PROFILE),
        nowIso(),
      ).run();
      await env.CMS_DB.prepare(
        'INSERT OR IGNORE INTO cms_documents (id, value_json, updated_at) VALUES (?, ?, ?)',
      ).bind(
        'private_profile_default',
        JSON.stringify(DEFAULT_PRIVATE_PROFILE),
        nowIso(),
      ).run();
    })().catch(error => {
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}

export async function getDocument(env, id, fallback = null){
  await ensureCmsDb(env);
  const row = await env.CMS_DB.prepare(
    'SELECT value_json FROM cms_documents WHERE id = ?',
  ).bind(id).first();
  return parseJson(row?.value_json, fallback);
}

export async function setDocument(env, id, value){
  await ensureCmsDb(env);
  await env.CMS_DB.prepare(
    'INSERT INTO cms_documents (id, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at',
  ).bind(id, JSON.stringify(value), nowIso()).run();
}

function normalizeUpdateRow(row){
  return {
    id: row.id,
    visibility: row.visibility,
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order) || 0,
    dateLabel: row.date_label,
    zh: row.zh_text,
    en: row.en_text,
    updatedAt: row.updated_at,
  };
}

export async function listUpdates(env, options = {}){
  await ensureCmsDb(env);
  const conditions = [];
  const bindValues = [];

  if(options.visibility){
    conditions.push('visibility = ?');
    bindValues.push(options.visibility);
  }
  if(options.onlyPublished){
    conditions.push('is_published = 1');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await env.CMS_DB.prepare(
    `SELECT * FROM cms_updates ${whereClause} ORDER BY sort_order ASC, updated_at DESC`,
  ).bind(...bindValues).all();
  return (result.results || []).map(normalizeUpdateRow);
}

export async function replaceUpdates(env, items){
  await ensureCmsDb(env);
  await env.CMS_DB.exec('DELETE FROM cms_updates');

  const normalized = Array.isArray(items) ? items : DEFAULT_UPDATES;
  for(const item of normalized){
    await env.CMS_DB.prepare(
      'INSERT INTO cms_updates (id, visibility, is_published, sort_order, date_label, zh_text, en_text, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).bind(
      item.id,
      item.visibility || 'public',
      item.isPublished ? 1 : 0,
      Number(item.sortOrder) || 0,
      item.dateLabel || '',
      item.zh || '',
      item.en || '',
      nowIso(),
    ).run();
  }
}

function normalizePostRow(row){
  return {
    id: row.id,
    slug: row.slug,
    visibility: row.visibility,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    title: {
      zh: row.title_zh,
      en: row.title_en,
    },
    excerpt: {
      zh: row.excerpt_zh,
      en: row.excerpt_en,
    },
    content: {
      zh: row.content_zh,
      en: row.content_en,
    },
    tags: parseJson(row.tags_json, []),
    coverImage: normalizeCoverImage(parseJson(row.cover_image_json, {})),
    path: `/notes/${row.slug}`,
  };
}

async function getPostRowById(env, id){
  await ensureCmsDb(env);
  return env.CMS_DB.prepare(
    'SELECT * FROM cms_posts WHERE id = ? LIMIT 1',
  ).bind(id).first();
}

export async function listPosts(env, options = {}){
  await ensureCmsDb(env);
  const conditions = [];
  const bindValues = [];

  if(options.visibility){
    conditions.push('visibility = ?');
    bindValues.push(options.visibility);
  }
  if(options.status){
    conditions.push('status = ?');
    bindValues.push(options.status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await env.CMS_DB.prepare(
    `SELECT * FROM cms_posts ${whereClause}
      ORDER BY
        CASE
          WHEN status = 'published' THEN COALESCE(published_at, updated_at)
          ELSE updated_at
        END DESC,
        updated_at DESC`,
  ).bind(...bindValues).all();
  return (result.results || []).map(normalizePostRow);
}

export async function getPostBySlug(env, slug){
  await ensureCmsDb(env);
  const row = await env.CMS_DB.prepare(
    'SELECT * FROM cms_posts WHERE slug = ? LIMIT 1',
  ).bind(slug).first();
  return row ? normalizePostRow(row) : null;
}

export async function upsertPost(env, post){
  await ensureCmsDb(env);
  const existingRow = post.id ? await getPostRowById(env, post.id) : null;
  const publishingNow = (post.status || 'draft') === 'published';
  const firstPublishedTimestamp = existingRow?.status === 'published' && existingRow?.published_at
    ? existingRow.published_at
    : null;
  const effectivePublishedAt = publishingNow
    ? (firstPublishedTimestamp || nowIso())
    : (existingRow?.published_at || post.publishedAt || null);
  const normalized = {
    id: post.id,
    slug: (post.slug || '').trim(),
    visibility: post.visibility || 'public',
    status: post.status || 'draft',
    publishedAt: effectivePublishedAt,
    title: {
      zh: post.title?.zh || '',
      en: post.title?.en || '',
    },
    excerpt: {
      zh: post.excerpt?.zh || '',
      en: post.excerpt?.en || '',
    },
    content: {
      zh: post.content?.zh || '',
      en: post.content?.en || '',
    },
    tags: Array.isArray(post.tags) ? post.tags : [],
    coverImage: normalizeCoverImage(post.coverImage),
  };

  await env.CMS_DB.prepare(
    `INSERT INTO cms_posts (
      id, slug, visibility, status, published_at, updated_at,
      title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, tags_json, cover_image_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      visibility = excluded.visibility,
      status = excluded.status,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at,
      title_zh = excluded.title_zh,
      title_en = excluded.title_en,
      excerpt_zh = excluded.excerpt_zh,
      excerpt_en = excluded.excerpt_en,
      content_zh = excluded.content_zh,
      content_en = excluded.content_en,
      tags_json = excluded.tags_json,
      cover_image_json = excluded.cover_image_json`,
  ).bind(
    normalized.id,
    normalized.slug,
    normalized.visibility,
    normalized.status,
    normalized.publishedAt,
    nowIso(),
    normalized.title.zh,
    normalized.title.en,
    normalized.excerpt.zh,
    normalized.excerpt.en,
    normalized.content.zh,
    normalized.content.en,
    JSON.stringify(normalized.tags),
    JSON.stringify(normalized.coverImage),
  ).run();

  const savedRow = await getPostRowById(env, normalized.id);
  return savedRow ? normalizePostRow(savedRow) : {
    ...normalized,
    updatedAt: nowIso(),
    path: `/notes/${normalized.slug}`,
  };
}

export async function deletePost(env, id){
  await ensureCmsDb(env);
  await env.CMS_DB.prepare('DELETE FROM cms_posts WHERE id = ?').bind(id).run();
}

export async function deleteAllPosts(env){
  await ensureCmsDb(env);
  await env.CMS_DB.prepare('DELETE FROM cms_posts').run();
}

export async function getAdminBootstrap(env){
  const translations = await getDocument(env, 'public_translations', DEFAULT_PUBLIC_TRANSLATIONS);
  const privateProfile = await getDocument(env, 'private_profile', DEFAULT_PRIVATE_PROFILE);
  const updates = await listUpdates(env);
  const posts = await listPosts(env);

  return {
    translationFields: TRANSLATION_FIELD_GROUPS,
    privateTranslationFields: PRIVATE_PROFILE_TRANSLATION_GROUPS,
    translations,
    privateProfile,
    updates,
    posts,
  };
}

export async function getPublicBootstrap(env){
  const translations = await getDocument(env, 'public_translations', DEFAULT_PUBLIC_TRANSLATIONS);
  const updates = await listUpdates(env, { visibility: 'public', onlyPublished: true });
  const posts = await listPosts(env, { visibility: 'public', status: 'published' });

  return {
    translations,
    updates,
    posts: posts.map(({ content, ...rest }) => rest),
  };
}

export async function getAcquaintanceBootstrap(env){
  const privateProfile = await getDocument(env, 'private_profile', DEFAULT_PRIVATE_PROFILE);
  const updates = await listUpdates(env, { visibility: 'acquaintance', onlyPublished: true });
  const posts = await listPosts(env, { visibility: 'acquaintance', status: 'published' });

  return {
    profile: privateProfile,
    updates,
    posts: posts.map(({ content, ...rest }) => rest),
  };
}

export function getDefaultPosts(){
  return DEFAULT_POSTS;
}

export async function getPrivateProfileDefault(env){
  return getDocument(env, 'private_profile_default', DEFAULT_PRIVATE_PROFILE);
}

export async function setPrivateProfileDefault(env, profile){
  await setDocument(env, 'private_profile_default', profile);
}
