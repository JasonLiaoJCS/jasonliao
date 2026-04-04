# How This Site Was Built

這份文件是「建站說明書」。

它的目標不是教你每天怎麼發文，而是完整解釋：

- 這個網站原本是什麼
- 我今天把它改成了什麼
- GitHub 和 Cloudflare 在這裡各自扮演什麼角色
- 為什麼原本是靜態網站，現在卻能有一個可登入的 Studio 後台
- 這整套系統是怎麼連起來的
- 你之後看到某些設定、日期、分支、部署畫面時，應該怎麼理解

---

## 1. 一句話版本

這個網站現在是：

- **GitHub** 負責保存程式碼與版本歷史
- **Cloudflare Pages** 負責部署網站
- **Cloudflare Pages Functions** 負責提供後台 API
- **Cloudflare D1** 負責保存你透過 Studio 修改的內容

所以它不再只是單純的靜態 HTML 檔案，而是：

**「保留原本前台設計的靜態網站 + 一個輕量後端 + 資料庫 + 後台介面」**

---

## 2. 原本的網站是什麼樣子

一開始這個網站本質上是典型靜態站：

- `index.html`
- `style.css`
- `app.js`
- `posts/*.html`
- `feed.xml`
- `sitemap.xml`
- `robots.txt`

這種網站的特點是：

- 優點：快、穩、便宜、好部署
- 缺點：沒有真正後台
- 缺點：如果要改內容，通常要直接改 HTML / JS / JSON / XML 再推上 GitHub

所以原本你每次要：

- 改首頁文案
- 發 blog
- 改熟客模式
- 調整個資顯示

都只能用「改檔案 + commit + push」的方式。

---

## 3. 為什麼要引入 Cloudflare

你後來需要的是：

- 一個可以登入的後台
- 圖形化管理介面
- 可以直接新增文章與 updates
- 可以設定某些內容是公開、某些內容是熟客限定
- 可以把個資和公開內容分開管理

這些東西用「純 GitHub Pages 靜態站」做不到，因為 GitHub Pages 本身不提供：

- 伺服器端登入驗證
- API
- 資料庫
- 權限控制

所以我們加了 Cloudflare。

Cloudflare 在這裡不是單純拿來加速而已，而是讓網站多出兩個非常重要的能力：

1. **Functions**
   讓網站可以有真正的伺服器邏輯

2. **D1**
   讓網站有一個可以存資料的 SQLite 資料庫

這就是為什麼你原本的靜態網站，現在可以多出 `/studio/` 這個後台。

---

## 4. GitHub 在這個架構裡做什麼

GitHub 現在仍然非常重要，但它的角色比較像：

- 程式碼倉庫
- 版本控制系統
- Cloudflare 的來源

簡單講：

### GitHub 管「程式」

例如：

- `index.html`
- `style.css`
- `app.js`
- `functions/...`
- `studio/...`
- `wrangler.toml`
- 各種文件

只要這些東西改了，就要：

1. 本地修改檔案
2. `git add`
3. `git commit`
4. `git push origin main`

然後 Cloudflare 才會自動拉最新程式碼重新部署。

### GitHub 不直接管「Studio 內容」

你在 Studio 裡改：

- 首頁公開文案
- updates
- posts
- 熟客資料

這些不是寫回 GitHub repo，而是寫進 **D1 資料庫**。

所以：

- **改程式 / 改設計 / 改架構** → GitHub
- **改內容 / 發文 / 改熟客資料** → Studio + D1

---

## 5. Cloudflare 在這個架構裡做什麼

### 5.1 Cloudflare Pages

Cloudflare Pages 是網站部署平台。

它會從你的 GitHub repo 抓程式碼，然後把網站發布出去。

你現在的 Pages 專案名稱是：

```text
jasonliao-pages
```

目前預設測試網址是：

```text
https://jasonliao-pages.pages.dev
```

### 5.2 Cloudflare Pages Functions

Functions 是這次真正讓靜態站升級成有後台網站的關鍵。

你 repo 裡的：

```text
functions/
```

底下那些檔案，會變成可呼叫的 API。

例如：

- `/api/admin/login`
- `/api/admin/bootstrap`
- `/api/admin/translations`
- `/api/admin/updates`
- `/api/admin/posts`
- `/api/admin/private-profile`
- `/api/admin/reset`
- `/api/public/bootstrap`
- `/api/acquaintance/login`

這些 API 讓前台與後台都能「不是只讀檔案」，而是能真的和資料庫互動。

### 5.3 Cloudflare D1

D1 是 Cloudflare 的 SQLite 資料庫服務。

你現在的資料庫名稱是：

```text
jasonliao-cms
```

在 `wrangler.toml` 裡，這個資料庫被綁成：

```toml
binding = "CMS_DB"
```

所以後端程式裡會透過 `CMS_DB` 來讀寫資料。

---

## 6. 這個架構現在怎麼串起來

你可以把整個網站想成下面這樣：

### A. 程式碼層

- `index.html`
- `style.css`
- `app.js`
- `studio/index.html`
- `studio/studio.js`
- `functions/**/*.js`

這些放在 GitHub。

### B. 部署層

Cloudflare Pages 從 GitHub 的 `main` 分支抓程式碼，然後部署成網站。

### C. 後端層

`functions/` 提供 API。

### D. 資料層

Cloudflare D1 儲存 CMS 內容。

### E. 後台層

`/studio/` 是管理介面。

### F. 前台層

公開網站會優先讀 Cloudflare API 的內容；如果 API 不存在或失敗，則退回靜態 fallback。

---

## 7. 為什麼前台還保留靜態 fallback

這是這次設計裡一個很重要的保險。

也就是說：

- 就算 Cloudflare 後台還沒完全設好
- 就算 Functions 暫時出錯
- 就算資料庫一開始還沒初始化完成

網站前台也不會整個死掉。

因為 `app.js` 會：

1. 先嘗試向 `/api/public/bootstrap` 拿資料
2. 如果拿不到，回退到 `index.html` 裡原本就有的靜態內容

這就是為什麼我一直說它不是「整站重來」，而是：

**「在原本靜態站上加出後台能力」**

---

## 8. 目前最重要的檔案有哪些

### 前台

- [index.html](C:/Users/User/Desktop/Blog/index.html)
- [style.css](C:/Users/User/Desktop/Blog/style.css)
- [app.js](C:/Users/User/Desktop/Blog/app.js)

### 後台 UI

- [studio/index.html](C:/Users/User/Desktop/Blog/studio/index.html)
- [studio/studio.js](C:/Users/User/Desktop/Blog/studio/studio.js)

### 後端 API

- [functions/api/admin/login.js](C:/Users/User/Desktop/Blog/functions/api/admin/login.js)
- [functions/api/admin/bootstrap.js](C:/Users/User/Desktop/Blog/functions/api/admin/bootstrap.js)
- [functions/api/admin/translations.js](C:/Users/User/Desktop/Blog/functions/api/admin/translations.js)
- [functions/api/admin/updates.js](C:/Users/User/Desktop/Blog/functions/api/admin/updates.js)
- [functions/api/admin/posts.js](C:/Users/User/Desktop/Blog/functions/api/admin/posts.js)
- [functions/api/admin/private-profile.js](C:/Users/User/Desktop/Blog/functions/api/admin/private-profile.js)
- [functions/api/admin/reset.js](C:/Users/User/Desktop/Blog/functions/api/admin/reset.js)
- [functions/api/acquaintance/login.js](C:/Users/User/Desktop/Blog/functions/api/acquaintance/login.js)
- [functions/api/public/bootstrap.js](C:/Users/User/Desktop/Blog/functions/api/public/bootstrap.js)

### 後端共用邏輯

- [functions/_lib/auth.js](C:/Users/User/Desktop/Blog/functions/_lib/auth.js)
- [functions/_lib/db.js](C:/Users/User/Desktop/Blog/functions/_lib/db.js)
- [functions/_lib/default-cms-content.js](C:/Users/User/Desktop/Blog/functions/_lib/default-cms-content.js)

### Cloudflare 設定

- [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml)
- [cloudflare/schema.sql](C:/Users/User/Desktop/Blog/cloudflare/schema.sql)
- [_headers](C:/Users/User/Desktop/Blog/_headers)

### 密碼工具

- [scripts/generate-site-password-hash.mjs](C:/Users/User/Desktop/Blog/scripts/generate-site-password-hash.mjs)
- [scripts/private-profile-passwords.mjs](C:/Users/User/Desktop/Blog/scripts/private-profile-passwords.mjs)

---

## 9. Cloudflare 怎麼和 GitHub 連起來

現在的流程是：

1. 你有一個 GitHub repo
2. Cloudflare Pages 連到這個 repo
3. Cloudflare 指定看 `main` 分支
4. 每次 `main` 有新 commit，Cloudflare 自動重新部署

所以你之後看到：

- Cloudflare 的 deployment 畫面
- GitHub 的 commit
- `main` 分支

它們其實是在講同一條鏈：

```text
本地改程式 -> push 到 GitHub main -> Cloudflare 自動部署
```

---

## 10. 為什麼之前會提到 branch / commit / 重新抓版本

因為 Cloudflare 部署的是「某一個 commit」。

比如你之前遇到的情況就是：

- 我本地已經修好了 bug
- GitHub `main` 上也有更晚的 commit
- 但 Cloudflare 成功部署的還停在舊 commit

所以當時你看到的錯誤畫面，其實是 **舊版程式**，不是你不會操作。

你之後要記住：

### 如果網站行為看起來和我說的不一樣

先去看 Cloudflare `Deployments`：

- 最新成功部署的 commit 是不是你以為的那個版本

這是排查的第一步。

---

## 11. 為什麼之前還改過 `compatibility_date`

在 [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml) 裡有：

```toml
compatibility_date = "2026-04-04"
```

這不是文章日期，也不是你的內容日期。

它是 Cloudflare Functions 的執行環境相容日期。

之前出現問題，是因為我一開始設成：

```toml
2026-04-05
```

但 Cloudflare 用 UTC 算時間，有一小段時間它會認為那還是「未來日期」，就報錯。

所以後來改成：

```toml
2026-04-04
```

### 你以後通常不用管這個

只有當 Cloudflare build 明確報：

- `Can't set compatibility date in the future`

你才需要處理。

平常不要去動它。

---

## 12. 為什麼後來又遇到 D1 的 SQL 錯誤

後來你看到過：

```text
D1_EXEC_ERROR: CREATE TABLE IF NOT EXISTS ...
```

這是因為我一開始用的是「把整包 schema SQL 一次丟給 D1 執行」的方式。

Cloudflare D1 在那個情境下對多段 SQL 的處理不穩，導致：

- 它只吃到某一段前半
- 最後報 `incomplete input`

後來我把它改成：

- 每張表一條一條建立

這個問題就被修掉了。

這部分你之後也通常不用管。

---

## 13. 現在登入為什麼比一開始容易很多

最初後台登入只吃 hash 型式的 secret，例如：

```text
ADMIN_PASSWORD_HASH
```

但那對新手很容易出錯，因為：

- 容易多複製空白
- 容易搞混原始密碼和 hash
- 容易貼進去錯欄位

所以後來我幫你加了直接密碼模式。

現在後台登入可接受：

### Admin

- `ADMIN_PASSWORD`
  或
- `ADMIN_PASSWORD_HASH`

### Acquaintance

- `ACQUAINTANCE_PASSWORD`
  或
- `ACQUAINTANCE_PASSWORD_HASH`

目前最建議你用的是：

- `ADMIN_PASSWORD`
- `ACQUAINTANCE_PASSWORD`

因為最直觀，也最不容易出錯。

---

## 14. 現在有哪些 Cloudflare 變數 / Secret

你最重要的有這些：

### 必要

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` 或 `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

### 熟客模式

- `ACQUAINTANCE_PASSWORD` 或 `ACQUAINTANCE_PASSWORD_HASH`

### 它們各自做什麼

#### `ADMIN_USERNAME`

後台登入帳號名。

#### `ADMIN_PASSWORD`

後台登入原始密碼。

#### `ADMIN_PASSWORD_HASH`

後台登入密碼的 hash 版本。

#### `ADMIN_SESSION_SECRET`

用來簽後台 session cookie 的密鑰。

#### `ACQUAINTANCE_PASSWORD`

熟客模式的原始密碼。

#### `ACQUAINTANCE_PASSWORD_HASH`

熟客模式的 hash 版本。

---

## 15. 為什麼這個網站現在既能保持搜尋，又能有後台

這次我們做的是「保留公開前台 + 把後台藏起來」。

### 公開前台

- 仍然可以被搜尋引擎索引
- 仍然是你的公開形象網站

### 後台

- 路徑是 `/studio/`
- 不出現在站內導覽
- `_headers` 裡有 `noindex`

### API

- `/api/*` 也設了 `noindex`

所以：

- 公開內容給 Google 看
- 後台和管理 API 不讓搜尋引擎索引

---

## 16. GitHub Pages 與 Cloudflare Pages 現在的關係

這一點非常重要。

目前這套架構可以理解成「兩層」：

### A. GitHub repo 裡的靜態版

這是原始站點內容。

### B. Cloudflare Pages 上的後台版

這是有 API、有 Studio、有資料庫的版本。

### 最關鍵的差別

如果你打開的是 **Cloudflare 的網站網址**，前台會去讀 D1 裡的 CMS 內容。  
如果你打開的是 **純 GitHub Pages 靜態網址**，它就會回退到 repo 裡的靜態 fallback。

也就是說：

**Studio 改的是 Cloudflare 這條資料流，不是直接改 GitHub Pages 靜態頁的 HTML。**

所以你之後要認清楚：

- 你現在主要維護的是 **Cloudflare 版**
- GitHub repo 仍然是程式碼來源
- 但日常改內容主要不再是直接改 HTML

---

## 17. 這次做完之後，你平常不用管什麼

以下這些東西，你平常幾乎都可以不用碰：

- `wrangler.toml` 的 `database_id`
- `wrangler.toml` 的 `compatibility_date`
- `functions/_lib/*`
- `cloudflare/schema.sql`
- `_headers`
- API 路由檔
- D1 table 結構
- GitHub branches（除非你要做程式開發）

---

## 18. 你平常需要管什麼

平常真正會碰到的只有兩種：

### 內容維護

在 `/studio/` 裡做：

- 改首頁文案
- 發 updates
- 發文章
- 管熟客資料
- 做 reset

### 程式維護

在本地 repo 做：

- 改版型
- 改動畫
- 改 CSS
- 改 JS 邏輯
- 改後台功能

然後再 `git push`。

---

## 19. 這整套系統現在已經具備的能力

### 公開版

- 中英切換
- 公開內容可被搜尋
- 公開版文案可由 Studio 修改

### 熟客模式

- 可用密碼保護較敏感資料
- 聯絡資訊與私人資料不再直接明文塞在公開頁原始碼

### 後台

- 登入
- 更新首頁公開文案
- 管理 updates
- 管理 posts
- 設定公開 / 熟客可見
- 管理熟客資料
- 回復預設

---

## 20. 目前已知限制

### 1. Studio 文章編輯器目前吃的是 HTML

不是 Notion editor，也不是 Markdown 所見即所得。

### 2. Cloudflare 後台目前一種角色只有一組密碼

也就是：

- Admin：1 組
- Acquaintance：1 組

### 3. 舊的 `private-data.js` 多密碼工具仍然存在，但不是主要路徑

[scripts/private-profile-passwords.mjs](C:/Users/User/Desktop/Blog/scripts/private-profile-passwords.mjs)

它可以幫舊的加密 payload 寫入多組有效密碼。  
但在現在的 Cloudflare server-backed 熟客模式裡，主流程還是單一 secret。

也就是說：

**如果你問「現在正式 Cloudflare 後台版可不可以同時有兩組以上 admin / 熟客密碼？」**

答案是：

- **目前正式流程不支援多組**
- 如果你真的要多組，需要再擴充後端

---

## 21. 我今天實際做了哪些事

高層版本如下：

1. 保留原本靜態網站前台
2. 加上中英切換與熟客模式整理
3. 加入 Cloudflare Pages 支援
4. 加入 Functions API
5. 加入 D1 CMS 資料庫
6. 做出 `/studio/` 後台
7. 加入 admin 登入流程
8. 加入熟客模式 server-side 驗證流程
9. 加入 Studio 發文、改文案、改熟客資料功能
10. 加入 reset 機制
11. 修正 Cloudflare compatibility date 問題
12. 修正 D1 schema 初始化問題
13. 把後台登入改成支援直接密碼 secret，降低出錯率

---

## 22. 你之後真的要記住的只有這幾件事

1. **改內容用 Studio**
2. **改程式才用 GitHub**
3. Cloudflare 正式部署看的是 `main`
4. Studio 改動進的是 D1，不是 GitHub 檔案
5. 如果畫面不對，先看 Cloudflare `Deployments` 的最新 commit
6. 如果只是內容改壞，先用 Studio 的 reset，不要急著改 code

---

## 23. 推薦你之後怎麼用這套系統

### 最簡單的習慣

- 日常發文、改首頁：只用 Studio
- 每次改完內容：自己打開前台確認一次
- 要改設計或功能：再回本地 repo 改 code

### 不建議的習慣

- 一邊在 Studio 改內容，一邊又手改 `index.html` 同一段文案
- 不確定自己看到的是 GitHub Pages 還是 Cloudflare Pages
- 亂改 `wrangler.toml`
- 亂改 Cloudflare bindings / D1 / Secrets 名稱

---

## 24. 相關補充文件

你現在 repo 裡還有這幾份較短的文件：

- [CLOUDFLARE_STUDIO_SETUP.md](C:/Users/User/Desktop/Blog/CLOUDFLARE_STUDIO_SETUP.md)
- [BLOG_PUBLISHING_GUIDE.md](C:/Users/User/Desktop/Blog/BLOG_PUBLISHING_GUIDE.md)
- [ACQUAINTANCE_MODE_PASSWORDS.md](C:/Users/User/Desktop/Blog/ACQUAINTANCE_MODE_PASSWORDS.md)

這份文件是總說明。  
如果你之後要實際操作網站，請優先看另一份：

- `SITE_MAINTENANCE_MANUAL.md`

