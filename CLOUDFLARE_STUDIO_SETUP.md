# Cloudflare Studio Setup

這份文件是新的後台 / CMS / 熟客權限系統的部署說明。

## 1. 這次新增了什麼

- `studio/`
  - 隱藏式後台 UI
- `functions/`
  - Cloudflare Pages Functions API
- `functions/notes/[slug].js`
  - 新的動態文章頁路由
- `wrangler.toml`
  - Cloudflare Pages / D1 綁定設定
- `cloudflare/schema.sql`
  - CMS 資料表 schema
- `scripts/generate-site-password-hash.mjs`
  - 產生後台與熟客模式密碼 hash

## 2. 這個架構的重點

公開前台仍然保留原本的靜態 fallback，所以：

- 現在的首頁、文章、雙語、熟客模式不會因為這次升級直接壞掉
- 你切到 Cloudflare 之後，前台會優先讀新的 API
- 如果 API 還沒接好，靜態內容仍會先撐住

## 3. 需要建立的 Cloudflare 資源

### Cloudflare Pages Project

把這個 GitHub repo 接到 Cloudflare Pages。

### D1 Database

建議名稱：

```text
jasonliao-cms
```

建立後，把 `database_id` 填回：

```toml
wrangler.toml
```

## 4. 需要設定的 Secrets

你至少要在 Cloudflare Pages / Workers Secrets 裡設定：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `ACQUAINTANCE_PASSWORD_HASH`

### `ADMIN_PASSWORD_HASH` / `ACQUAINTANCE_PASSWORD_HASH` 怎麼產生

在專案根目錄執行：

```powershell
node scripts\generate-site-password-hash.mjs
```

它會輸出一串：

```text
pbkdf2_sha256$...
```

把那串值貼到 Cloudflare secret 裡即可。

## 5. `ADMIN_SESSION_SECRET` 建議

這個不是密碼，是 session 簽章用 secret。請用一串高隨機性的長字串。

建議至少 32 字以上。

## 6. D1 schema

把這份 schema 套進 D1：

```text
cloudflare/schema.sql
```

## 7. 後台入口

後台頁面在：

```text
/studio/
```

它不會出現在站內導覽，而且 `_headers` 已經加上 `noindex`。

## 8. 新系統上線後可以做什麼

### Public Copy

可直接在後台改：

- Hero 自介
- About 主要段落
- Snapshot 主要描述
- Focus 區塊描述
- Contact 文案
- Footer motto

### Updates

可新增 / 編輯：

- 首頁 `Latest Updates`
- 公開更新
- 熟客限定更新

### Posts

可新增 / 編輯：

- `Draft` / `Published`
- `Public` / `Acquaintance`
- 中英文標題
- 中英文摘要
- 中英文 HTML 內容
- tags

新的 managed posts 會走：

```text
/notes/<slug>
```

### Acquaintance Profile

可管理：

- Email
- Phone
- Instagram
- 熟客模式下顯示的學經歷文案
- 熟客模式照片

## 9. SEO 與公開網址

這次的設計是：

- 盡量保留你現在公開前台的網址結構
- 後台與 API `noindex`
- 熟客限定內容不進 sitemap

所以不是「整站重來」，而是「前台盡量延續、後台另外加進來」。

## 10. 重要提醒

### 目前仍保留靜態熟客模式 fallback

也就是說，在你正式切到 Cloudflare 後台之前，現在 repo 裡原本的熟客模式仍然還在。

如果你之後確認 Cloudflare 版熟客模式已經完全可用，而且私密資料都已經改成由後台管理，再考慮移除舊的：

- `private-data.js`

這樣公開 repo 的私密暴露面會再更小一點。
