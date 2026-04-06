# Jason Liao 個人網站

這個 repository 是 Jason Liao 個人網站的完整原始碼。

它不是單純的靜態單頁網站，而是一個混合式架構的專案，包含：

- 對外公開的個人網站前台
- 隱藏的內容管理後台 `/studio/`
- Cloudflare Pages Functions 後端路由
- Cloudflare D1 資料庫
- 受保護的熟客模式內容

正式網站：

- `https://jasonliao-pages.pages.dev/`

## 這個專案是什麼

表面上看，這是一個用原生 HTML、CSS、JavaScript 製作的個人網站。

實際上，它已經不只是靜態網站，而是「靜態前台 + 輕量 CMS + 權限控管 + 資料庫」的組合。

這個專案現在支援的事情包含：

- 不直接改 HTML 也能更新首頁文案
- 透過後台管理首頁 updates
- 發布新的 blog / notes
- 控制文章是公開還是只限熟客模式可見
- 管理較完整的私密個人資料與熟客模式照片

這個 repository 刻意維持 framework-light 的方向。它沒有用 React、Vue 或大型前端框架，而是希望保留：

- 前台載入快
- 結構清楚
- 容易維護
- 程式行為容易直接追蹤

同時再用 Cloudflare 補上後端能力。

## 為什麼會長成這樣

這個網站原本是靜態網站，而靜態網站有很多優點：

- 簡單
- 快
- 穩定
- 容易部署

但純靜態網站不適合處理下面這些需求：

- 登入後台
- 權限驗證
- 私密內容保護
- CMS 發文
- 可重置的內容管理流程

所以現在的做法是保留靜態網站的前台優勢，再加上：

- Cloudflare Pages Functions 作為後端 API
- Cloudflare D1 作為資料儲存層
- `/studio/` 作為後台操作介面

這樣做的好處是：

- 公開網站仍然輕量快速
- 日常內容更新不需要每次改程式碼
- 私密內容不需要直接塞在公開頁面裡
- 專案仍然維持可讀性，不會變成很重的框架專案

## 主要功能

- 質感導向的個人網站首頁
- 響應式設計，支援桌機、平板、手機
- 中英雙語切換
- 首頁個人介紹、研究背景、Writing、Contact 等區塊
- CMS 管理的首頁最新動態
- CMS 管理的文章 / notes
- 熟客模式解鎖與自動鎖定
- Studio 後台登入與內容管理
- Markdown 編輯器與即時預覽
- 本機草稿 autosave
- 動態 `/notes/<slug>` 文章路由
- 自動產生正式站的 sitemap
- 與舊版 `posts/*.html` 靜態文章相容

## 整體架構

```text
公開訪客
  -> index.html + style.css + app.js
  -> app.js 向 /api/public/bootstrap 取資料
  -> Cloudflare Pages Functions
  -> Cloudflare D1

如果公開 CMS 資料暫時失敗
  -> 前台回退到內建靜態內容

管理者
  -> /studio/
  -> /api/admin/*
  -> Cloudflare D1

熟客模式使用者
  -> /api/acquaintance/login
  -> 簽章 session cookie
  -> /api/acquaintance/bootstrap
  -> 取得受保護資料

文章頁
  -> /notes/<slug>
  -> Function 判斷文章是否公開、是否需要熟客 session
```

可以把這個系統理解成四層：

1. 公開前台
2. Studio 後台前端
3. Cloudflare Functions 後端
4. D1 資料層

## 公開前台怎麼運作

公開前台的核心檔案是：

- `index.html`
- `style.css`
- `app.js`

其中 `app.js` 是整個前台的主控制程式，負責：

- 中英切換
- 首頁 CMS 資料讀取
- updates 渲染
- post / featured post 渲染
- 熟客模式解鎖與自動鎖定
- 受保護欄位切換
- 視覺特效與互動效果

這個專案一個很重要的設計是 fallback。

前台不會假設後端永遠正常。它會先嘗試讀 `/api/public/bootstrap`，如果拿不到資料，仍然可以回退到頁面內建的靜態內容。這樣就算 CMS 或 API 一時有問題，公開首頁也不會整個失效。

## Studio 後台

後台入口是：

- `/studio/`

相關檔案：

- `studio/index.html`
- `studio/studio.js`
- `studio/studio.css`
- `studio/studio-fx.js`

Studio 是這個網站日常內容管理的主介面，主要功能包括：

- 管理員登入
- Dashboard 總覽
- 公開首頁文案編輯
- 首頁 updates 管理
- 文章新增 / 編輯 / 刪除
- 熟客模式資料編輯
- reset 與 default baseline 流程
- 草稿預覽
- 本機 autosave

文章編輯器目前是 Markdown-first，而不是完整 WYSIWYG。這樣的好處是：

- 儲存格式比較乾淨
- 容易保留內容結構
- 仍然可以提供預覽與圖片插入
- 對個人網站規模來說夠用而且穩定

## 公開內容、私密內容、熟客模式

這個網站的內容不是全部混在一起，而是有分層次。

### 公開內容

公開內容任何人都能看，必要時也能被搜尋引擎索引。

例如：

- 首頁公開文案
- 公開 updates
- 公開且已發布的 notes

### 熟客模式內容

熟客模式解鎖後，才會顯示較完整的內容。

例如：

- 更完整的個人背景
- 聯絡方式
- 熟客模式照片
- 熟客限定 updates
- 熟客限定 notes

這不是單純把所有資料先塞進前台再用 CSS 藏起來，而是透過後端 API 控制。沒有有效熟客 session 的情況下，前台拿不到那些受保護的資料。

## 文章系統

這個 repository 現在有兩條文章路徑。

### 1. CMS managed posts

這是目前的主要發文方式。

特性：

- 存在 Cloudflare D1
- 透過 Studio 編輯
- 正式網址是 `/notes/<slug>`
- 可以設定為 `public` 或 `acquaintance`
- 公開且已發布的文章會自動進正式站 sitemap

### 2. 舊版靜態文章

這些是早期保留的手寫 HTML 文章：

- `posts/reason-passion.html`
- `posts/math-robotics.html`
- `posts/baseball-engineering.html`

它們現在仍然有價值，因為：

- 可以保留早期文章
- 可以當靜態 fallback
- 可以當舊內容結構的參考

但如果是新的文章內容，現在比較建議走 Studio / CMS 路線。

## 資料模型

D1 schema 定義在：

- `cloudflare/schema.sql`

目前主要資料表有：

- `cms_documents`
  - 存 document 型態內容，例如公開文案、熟客資料、featured post 設定
- `cms_updates`
  - 存首頁 updates，包含 visibility、排序、日期與中英文字
- `cms_posts`
  - 存文章資料，包含 slug、status、visibility、雙語 title / excerpt / content、tags、cover image

後端資料層實作在：

- `functions/_lib/db.js`

它負責：

- 確保 schema 存在
- 補齊預設資料
- documents 讀寫
- updates 全量替換
- posts 查詢 / 寫入 / 刪除
- featured post 設定
- public / admin / acquaintance bootstrap payload 組裝

## 安全與隱私設計

這個網站的安全模型不是大型企業級系統，但也不是假的保護。

目前重點包括：

- Studio 管理員登入使用簽章 cookie
- 熟客模式也有獨立的 session cookie
- `/studio/*` 設為 `no-store`、`noindex`
- `/api/*` 設為 `no-store`、`noindex`
- 沒有熟客 session 時，熟客 bootstrap API 直接回 `401`
- acquaintance-only 文章會在 `/notes/[slug].js` 裡做 server-side gate

相關 auth 邏輯在：

- `functions/_lib/auth.js`

它負責：

- 密碼驗證
- PBKDF2 hash 相容處理
- cookie parsing / serialization
- session token 簽章與驗證
- admin 帳密驗證
- acquaintance password 驗證

另外，repo 裡仍然保留 `private-data.js`，但那已經不是正式站現在主要使用的私密資料來源。

## 主要路由

| 路由 | 功能 |
| --- | --- |
| `/` | 公開首頁 |
| `/studio/` | 管理後台 |
| `/api/public/bootstrap` | 公開前台 CMS bootstrap |
| `/api/admin/login` | 管理員登入 |
| `/api/admin/bootstrap` | Studio 初始化資料 |
| `/api/admin/translations` | 儲存公開首頁文案 |
| `/api/admin/updates` | 儲存首頁 updates |
| `/api/admin/posts` | 管理 CMS 文章 |
| `/api/admin/private-profile` | 儲存熟客資料 |
| `/api/admin/private-profile-default` | 讀寫熟客 reset default |
| `/api/admin/reset` | 重置部分或全部 CMS 內容 |
| `/api/acquaintance/login` | 熟客模式登入 |
| `/api/acquaintance/bootstrap` | 熟客模式資料 |
| `/notes/<slug>` | 動態文章頁 |
| `/posts/*.html` | 舊版靜態文章頁 |
| `/sitemap.xml` | 正式站動態 sitemap |
| `/feed.xml` | 靜態 RSS feed |

## 專案結構

```text
.
├── index.html
├── style.css
├── app.js
├── 404.html
├── feed.xml
├── sitemap.xml
├── robots.txt
├── _headers
├── wrangler.toml
├── assets/
├── cloudflare/
├── functions/
├── posts/
├── private/
├── photo/
├── scripts/
├── shared/
└── studio/
```

更細一點來看：

- `index.html`
  - 公開首頁 HTML 結構與 SEO metadata
- `style.css`
  - 全站樣式，包含首頁、文章頁、private modal、RWD 與 effect profiles
- `app.js`
  - 前台互動、CMS 載入、i18n、熟客模式、動畫
- `studio/`
  - 後台 UI 與後台互動邏輯
- `functions/`
  - Cloudflare Pages Functions 路由與共用後端函式
- `shared/markdown.mjs`
  - Markdown 與 rich content renderer，Studio 與動態文章頁共用
- `posts/`
  - 舊版靜態文章
- `assets/`
  - logo、favicon、OG 圖等資產
- `cloudflare/schema.sql`
  - D1 schema 定義
- `scripts/`
  - 密碼與私密資料同步的輔助腳本
- `private/`
  - 本地私密 seed 資料
- `photo/`
  - 本地原始照片

## 本地開發

這個網站的前台 shell 沒有傳統 build step。

所以本地開發通常有兩種情境：

### 只看前台畫面

如果你只是想調整：

- 首頁版面
- CSS
- 動畫
- 靜態文章頁

那用任何簡單的靜態伺服器就夠了。

### 要跑完整 CMS / API

如果你需要測試：

- `/api/*`
- `/studio/`
- D1 內容
- 動態 `/notes/<slug>`

那就需要 Cloudflare Pages 的本地開發環境，而且要有：

- 正確的 Cloudflare 設定
- `CMS_DB` binding
- 必要 secrets

## 部署方式

這個專案的正式部署目標是 Cloudflare Pages。

部署時的核心組件包括：

- `wrangler.toml`
- `cloudflare/schema.sql`
- `_headers`
- Cloudflare Pages project 設定
- D1 database binding
- Cloudflare secrets

如果要部署出完整的 CMS 版本，需要：

1. 建立 Cloudflare Pages 專案並接上這個 repo
2. 建立 D1 database
3. 將 D1 綁定成 `CMS_DB`
4. 把 `cloudflare/schema.sql` 套用到資料庫
5. 在 Cloudflare 設定必要 secrets

主要 secrets：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ACQUAINTANCE_PASSWORD`

目前也相容某些 hash-based secret 流程，但對現階段來說，直接用 plain secret 是比較直覺、也比較穩定的做法。

## 圖片與媒體資料怎麼存

目前這個專案沒有另外接 R2 或外部圖床來存 CMS 內容圖片。

現在的做法是：

- 文章封面跟著文章資料走
- 文章內嵌圖片跟著文章內容流程走
- 熟客模式照片跟著 private profile document 走

這樣做的好處是架構簡單，但也代表這套內容模型比較適合個人網站規模，而不是大型媒體型站點。

## SEO 與索引策略

這個專案同時有靜態和動態的 SEO 結構。

靜態檔案包含：

- `robots.txt`
- fallback `sitemap.xml`
- `feed.xml`

正式站則有動態行為：

- `/sitemap.xml` 由 `functions/sitemap.xml.js` 動態產生
- 公開且已發布的 CMS notes 會自動加入 sitemap
- 熟客限定文章不會進 sitemap

另外，Studio 與 API 都刻意排除搜尋引擎索引。

## Repository 內的重要文件

如果你想進一步了解這個專案，下面幾份文件很重要：

- `HOW_THIS_SITE_WAS_BUILT.md`
  - 說明整體架構與設計原因
- `SITE_MAINTENANCE_MANUAL.md`
  - 偏日常維護 SOP
- `BLOG_PUBLISHING_GUIDE.md`
  - 說明現在的發文流程與舊版靜態文章差異
- `CLOUDFLARE_STUDIO_SETUP.md`
  - Cloudflare、Studio、D1、Secrets 相關設定
- `README_DEPLOY.md`
  - 較早期的靜態站部署說明

## 這個 repository 適合誰看

這個 repository 對下面幾種人都可能有幫助：

- 想看看這個網站怎麼做的人
- 想參考 framework-light 個人網站架構的人
- 想看 Cloudflare Pages + Functions + D1 如何搭一個小型 CMS 的人
- 之後需要維護這個網站的人

它不是通用型 starter template，而是一個高度客製化、以個人網站需求為核心設計出來的專案。

## 建議閱讀順序

如果你是第一次打開這個 repo，建議這樣看：

1. 先讀這份 README
2. 再讀 `HOW_THIS_SITE_WAS_BUILT.md`
3. 打開 `index.html`
4. 打開 `app.js`
5. 打開 `studio/studio.js`
6. 打開 `functions/_lib/db.js`
7. 打開 `functions/notes/[slug].js`

這樣會最快掌握：

- 公開前台怎麼組
- 前台怎麼跟 CMS 串接
- 後台怎麼管理內容
- 資料怎麼存在 D1
- 動態文章頁怎麼做權限判斷
