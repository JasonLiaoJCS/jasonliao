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
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ACQUAINTANCE_PASSWORD`

### 想先快速排除登入問題時

後端同時也支援比較簡單的直接密碼 secret：

- `ADMIN_PASSWORD`
- `ACQUAINTANCE_PASSWORD`

如果你已經被 hash 搞亂、後台一直登不進去，最簡單的救援做法是：

1. 先把 `ADMIN_USERNAME` 設成你確定的值，例如 `jason`
2. 新增 `ADMIN_PASSWORD`，值直接就是你要登入後台時輸入的原始密碼
3. 如果要測熟客模式，也新增 `ACQUAINTANCE_PASSWORD`

這樣就不需要先處理 `pbkdf2_sha256$...` 的 hash，也比較不容易因為複製格式出錯。

### `ADMIN_PASSWORD_HASH` / `ACQUAINTANCE_PASSWORD_HASH` 還能不能用

可以，但現在已經不是最推薦的主流程。

如果你真的想用 hash 版 secret，再在專案根目錄執行：

```powershell
node scripts\generate-site-password-hash.mjs
```

它會輸出一串：

```text
pbkdf2_sha256$...
```

把那串值貼到 Cloudflare secret 裡即可。

但如果你只是想穩定使用後台，直接設：

- `ADMIN_PASSWORD`
- `ACQUAINTANCE_PASSWORD`

通常會更直觀，也比較不容易因為複製格式出錯。

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
- 自動發布時間
- 中英文標題
- 中英文摘要
- 中英文 Markdown 內容
- tags
- 封面圖
- 封面圖 alt
- 文章內插圖

新的 managed posts 會走：

```text
/notes/<slug>
```

目前 Studio 文章編輯器是：

- Markdown 編輯
- 常用格式工具列
- Live Preview 即時預覽
- `Preview Draft`
- 本機 autosave 草稿
- 發布前 checklist
- `Add Photos` 插圖

`Published` 不需要手動選日期。第一次正式發布時，系統會自動寫入當下的發布時間；首頁 Blog 主打文章也會依最新發布時間自動排序。

目前圖片格式：

- `PNG`
- `JPG`
- `JPEG`

另外：

- 公開且已發布的 `/notes/<slug>` 文章會自動進正式站的 `sitemap.xml`
- 熟客限定文章不會進 sitemap

另外保留相容層：

- 舊的 HTML 文章仍然可以正常顯示
- 新文章建議直接用 Markdown 寫

### Acquaintance Profile

可管理：

- Email
- Phone
- Instagram
- 熟客模式下顯示的學經歷文案
- 熟客模式照片
  - 可上傳
  - 可移除舊照片後再儲存

## 8.1 資源現在怎麼存

目前這套架構沒有額外接 R2 或外部圖床。

也就是說：

- 文章內圖片會跟文章內容一起存在 D1
- 封面圖會跟文章資料一起存在 D1
- 熟客照片會跟 `private_profile` 文件一起存在 D1
- 這些內容都不會進 GitHub repo

### 刪掉後怎麼回收

- 刪文章內圖片：
  - 從編輯器刪掉圖片標記
  - 再按 `Save Post`
- 刪封面圖：
  - 按 `Remove Cover`
  - 再按 `Save Post`
- 刪熟客照片：
  - 按 `Remove Image`
  - 再按 `Save Acquaintance Profile`

### 本機 autosave 草稿

- 只存在目前瀏覽器 `localStorage`
- 不會進 GitHub
- 不會變成 Cloudflare 的獨立圖片資源
- Studio 已內建清理機制，不會無限制累積

## 9. SEO 與公開網址

這次的設計是：

- 盡量保留你現在公開前台的網址結構
- 後台與 API `noindex`
- 熟客限定內容不進 sitemap

所以不是「整站重來」，而是「前台盡量延續、後台另外加進來」。

## 10. 重要提醒

### 舊的 `private-data.js` 已不是正式站主流程

更早以前曾經有一套靜態本地加密的熟客模式流程，核心檔案是：

- `private-data.js`

但現在正式 Cloudflare 版的主流程已經改成：

- Cloudflare Secrets 控制密碼
- Cloudflare Functions 驗證熟客 session
- D1 儲存熟客資料

正式部署站上，舊的 `private-data.js` 路線已經被停用成安全 stub，不再是正式熟客資料來源。
