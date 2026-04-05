# How This Site Was Built

這份文件是「架構說明書」。

它的用途不是教你每天怎麼發文，而是把這個網站今天到底被改成了什麼、為什麼這樣改、GitHub 和 Cloudflare 各自做什麼、哪些東西是內容、哪些東西是基礎架構，完整講清楚。

如果你想知道：

- 這個網站原本是什麼
- 為什麼原本是靜態站，現在卻有一個可登入的 Studio
- GitHub、Cloudflare Pages、Functions、D1 分別扮演什麼角色
- 為什麼有時候要看 commit、branch、deployment、compatibility date
- 為什麼現在可以保留公開網站，又把熟客資料藏在受保護的地方
- 為什麼不需要一台電腦永遠開著當作伺服器
- 如何加入新的主題頁面（例如駕駛網站或教授網站）
- 靜態個人網站、競賽網站、有互動登入的網站，到底有什麼差別

就先看這份。

如果你是要實際操作網站、發文、改文案、改熟客模式，請看：

- [SITE_MAINTENANCE_MANUAL.md](C:/Users/User/Desktop/Blog/SITE_MAINTENANCE_MANUAL.md)

---

## 1. 一句話總結

這個網站現在是：

- GitHub 負責保存程式碼與版本歷史
- Cloudflare Pages 負責把網站部署出去
- Cloudflare Pages Functions 負責提供後台 API
- Cloudflare D1 負責保存你透過 Studio 修改的內容
- `/studio/` 是你登入後管理網站的後台

所以它不再只是「一堆 HTML 檔」，而是：

**保留原本前台設計的靜態網站 + 一個輕量後端 + 一個資料庫 + 一個可登入的管理介面**

---

## 2. 原本的網站是什麼樣子

一開始這個網站本質上是典型靜態網站。

主要是：

- `index.html`
- `style.css`
- `app.js`
- `posts/*.html`
- `feed.xml`
- `sitemap.xml`
- `robots.txt`

這種網站的特點是：

- 很快
- 很穩
- 很容易部署
- 沒有真正的伺服器
- 沒有資料庫
- 沒有真正的登入系統
- 沒有後台

所以以前如果你想改：

- 首頁文字
- 熟客模式的資料
- 發 blog
- 發 notes
- 改 updates

你都得直接改檔案，再 `git commit`、`git push`。

---

## 3. 為什麼後來要改架構

你後來需要的不只是「網站會顯示」，而是：

- 一個後台
- 可以登入
- 可以直接發文章
- 可以直接改首頁文案
- 可以直接改熟客模式資料
- 可以控制公開 / 熟客可見權限
- 盡量不要再把私密資料直接放在公開原始碼裡

這些能力，純 GitHub Pages 靜態站做不到。

因為 GitHub Pages 本身不提供：

- 伺服器端登入驗證
- API
- 資料庫
- 權限控制

所以我們保留原本前台，另外在 Cloudflare 上加了一層：

- Pages
- Functions
- D1

這就是為什麼你原本的靜態網站，現在可以有一個 `/studio/`。

---

## 4. GitHub 在這套系統裡做什麼

GitHub 現在仍然是核心，但它的角色比較像：

- 程式碼倉庫
- 版本控制系統
- Cloudflare 的程式碼來源

### GitHub 現在主要管什麼

- 前台檔案
  - `index.html`
  - `style.css`
  - `app.js`
- 後台檔案
  - `studio/index.html`
  - `studio/studio.js`
  - `studio/studio.css`
- 後端程式
  - `functions/**/*.js`
- Cloudflare 設定
  - `wrangler.toml`
  - `cloudflare/schema.sql`
  - `_headers`
- 文件
  - 各種 `.md`

### GitHub 現在不直接管什麼

你在 Studio 裡改的內容，通常不是直接寫回 GitHub repo，而是寫進 D1。

例如：

- 首頁公開文案
- 熟客模式下的文字、聯絡資訊、照片
- 最新 updates
- CMS 管理的 posts / notes

所以你要記一個非常重要的分工：

- **改程式 / 改設計 / 改架構**：GitHub
- **改內容 / 發文 / 改熟客資料**：Studio + D1

---

## 5. Cloudflare 在這套系統裡做什麼

Cloudflare 不是只是「幫網站加速」。

在這個網站裡，它做了三件真正關鍵的事。

### 5.1 Cloudflare Pages

Cloudflare Pages 是部署平台。

它做的事是：

1. 從 GitHub repo 抓程式碼
2. 讀 `main` 分支
3. 建站
4. 發布成可上網的網站

你目前的 Pages 專案名稱是：

```text
jasonliao-pages
```

目前測試 / 正式使用中的網址是：

```text
https://jasonliao-pages.pages.dev
```

### 5.2 Cloudflare Pages Functions

這是把靜態網站升級成「有後端」的關鍵。

你 repo 裡的：

```text
functions/
```

底下的檔案，會被 Cloudflare 當成 API。

例如：

- `/api/admin/login`
- `/api/admin/session`
- `/api/admin/bootstrap`
- `/api/admin/translations`
- `/api/admin/updates`
- `/api/admin/posts`
- `/api/admin/private-profile`
- `/api/admin/private-profile-default`
- `/api/admin/reset`
- `/api/acquaintance/login`
- `/api/acquaintance/bootstrap`
- `/api/public/bootstrap`

這些 API 讓網站不再只是「把檔案吐出來」，而是可以：

- 驗證登入
- 讀資料庫
- 寫資料庫
- 根據權限決定回傳什麼內容

### 5.3 Cloudflare D1

D1 是 Cloudflare 的 SQLite 資料庫。

你現在的 D1 資料庫名稱是：

```text
jasonliao-cms
```

在 [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml) 裡，它被綁定成：

```toml
binding = "CMS_DB"
```

也就是說，Functions 會透過 `CMS_DB` 這個名字去讀寫資料。

---

## 6. 為什麼靜態網站現在可以有 Studio 後台

因為現在它已經不是「只有靜態頁」了，而是多了一個完整資料流：

1. GitHub 存程式碼
2. Cloudflare Pages 部署程式
3. Functions 提供 API
4. D1 存內容
5. `/studio/` 用這些 API 去改 D1
6. 前台再從 API 讀內容顯示出來

所以 `/studio/` 不是魔法，也不是把靜態網站硬塞一個假表單。

它背後是：

- 有登入驗證
- 有 session
- 有資料庫
- 有 API

這就是「原本是靜態站，現在卻能像小型 CMS 一樣工作」的原因。

---

## 7. 整個系統現在怎麼串起來

你可以把它想成 6 層。

### A. 程式碼層

放在 GitHub：

- 前台 HTML / CSS / JS
- Studio 前端
- Functions 後端
- 文件與設定

### B. 部署層

Cloudflare Pages 從 GitHub `main` 分支抓程式碼，部署成網站。

### C. 後端層

`functions/` 提供登入、內容管理、公開資料、熟客資料等 API。

### D. 資料層

D1 儲存 CMS 內容。

### E. Studio 層

`/studio/` 是管理界面，透過 API 去改 D1。

### F. 前台層

前台網站優先讀 Cloudflare API 回來的內容。

---

## 8. 為什麼前台還保留 fallback

這是一個很重要的保險設計。

意思是：

- 就算 Functions 暫時出問題
- 就算 D1 還沒完全設好
- 就算你剛搬站、後台還沒填完整

前台網站也不應該整個死掉。

所以 `app.js` 會先：

1. 試著向 `/api/public/bootstrap` 拿資料
2. 拿不到時，回退到頁面本身的靜態預設內容

這就是為什麼這次不是「整站重寫」，而是「保留前台 + 升級資料來源」。

---

## 9. 公開模式與熟客模式現在怎麼分

這是這套網站最重要的隱私設計之一。

### 公開模式

公開模式下，網站只應該顯示：

- 公開版文案
- 概括、保守的描述
- 不含核心個資與完整學歷細節的內容

例如：

- 不顯示中文姓名
- 不顯示電話、Email、Instagram
- 不顯示完整學校名稱與細節學歷
- 不顯示熟客專用照片

### 熟客模式

熟客模式解鎖後，前台才會切換成較完整版本，例如：

- 熟客版簡介
- 熟客版 About
- 熟客版學經歷
- 聯絡方式
- 熟客照片

### 這件事是怎麼做到的

不是只靠 CSS 隱藏，也不是把所有私密資料都先塞在公開頁面裡再藏起來。

現在正式 Cloudflare 流程是：

- 公開 API：只回公開內容
- 熟客 API：沒有熟客 session 時直接 `401`
- 前台只有在熟客登入成功後，才會向熟客 API 拿資料覆蓋畫面

---

## 10. 熟客模式和舊版本地加密機制的關係

以前曾經有一套比較早期的靜態熟客模式：

- 以 `private-data.js` 為核心
- 本地解密
- 可支援多組密碼

但那是舊流程。

現在正式上線的 Cloudflare 版本，主流程已經改成：

- Server-backed acquaintance session
- Cloudflare secrets 控制密碼
- D1 管熟客資料

而且舊的 `private-data.js` 現在在正式站上已經被停用成安全 stub，不再是正式資料來源。

### 這句話要記住

**現在正式站的熟客模式，主要看的是 Cloudflare 的 `ACQUAINTANCE_PASSWORD` 與 D1，不是以前那套本地多密碼工具。**

---

## 11. 為什麼你之前會聽到 branch、commit、deployment

因為 Cloudflare 每次部署的不是「抽象的最新版本」，而是：

**GitHub 某一個具體的 commit**

這代表有時候會發生這種情況：

- 我本地已經修好了
- GitHub `main` 也已經有新 commit
- 但 Cloudflare 還沒部署到那一版

所以你打開網站時，看到的還是舊行為。

### 你之後最重要的排查動作

如果網站行為和你預期不一樣，第一步不是亂改東西，而是：

1. 打開 Cloudflare `Deployments`
2. 看最新成功部署的 commit 是哪一個
3. 確認它是不是你以為的那版

---

## 12. 什麼是 `main` 分支，為什麼你平常幾乎不用管其他 branch

Git 裡的 branch 可以理解成平行工作線。

但你現在這個網站的正式線，非常簡單：

- 正式版本看 `main`
- Cloudflare production 追蹤 `main`

所以你平常不需要管一堆 branch。

你只要知道：

- 如果是正式改程式，最後推到 `main`

就夠了。

---

## 13. `compatibility_date` 是什麼，為什麼之前還改過日期

在 [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml) 裡有一行：

```toml
compatibility_date = "2026-04-04"
```

它不是文章日期，也不是你網站內容的日期。

它是 Cloudflare Functions 的執行環境相容日期。

### 之前為什麼它出過問題

因為一開始設成了未來日期，而 Cloudflare 會用 UTC 時間判斷，結果在某些時區下它會覺得你填的是「未來日期」，就報：

```text
Can't set compatibility date in the future
```

所以後來改成比當時更安全的一天。

### 你之後要不要管它

通常不用。

除非 Cloudflare build 明確報 compatibility date 相關錯誤，不然不要碰它。

---

## 14. D1 是怎麼接進來的

現在 D1 會透過 [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml) 綁定：

```toml
[[d1_databases]]
binding = "CMS_DB"
database_name = "jasonliao-cms"
database_id = "9754b1b1-a382-45cb-b1aa-d55bbf6f0f9c"
```

重點是：

- `database_name` 是你建立的資料庫名字
- `database_id` 是 Cloudflare 給這個資料庫的唯一 ID
- `binding` 是程式碼裡拿來用的名字

### 這代表什麼

後端程式不會直接寫死「去哪個資料庫」，而是透過 `CMS_DB` 這個 binding 去使用目前綁好的 D1。

### 你之後通常要不要動它

不要。

除非你真的重建了一個新的 D1 資料庫，否則不要改 `database_id`。

---

## 15. Studio 的登入現在怎麼運作

Studio 現在的登入邏輯大致是：

1. 你打開 `/studio/`
2. 輸入 `ADMIN_USERNAME` 與 `ADMIN_PASSWORD`
3. 後端驗證成功後，簽一個 admin session cookie
4. 前端進到後台

### 目前的保護特性

- 新開一個 Studio 分頁，預設要重新登入
- 重開瀏覽器後，預設要重新登入
- 閒置 10 分鐘會自動登出
- Studio 與 API 都有 `noindex` / `no-store`

---

## 16. 為什麼 Secret 改完有時還是沒立即生效

因為 Cloudflare secret 改完後，常常需要重新部署，新的 runtime 才會穩定吃到新值。

所以：

- 改完 `ADMIN_PASSWORD`
- 改完 `ACQUAINTANCE_PASSWORD`
- 改完 `ADMIN_SESSION_SECRET`

之後都建議重新部署一次。

### 還有一件事要記住

Cloudflare 的 Secret 一旦存進去，值通常不能再顯示出來。

也就是說：

- 你看得到名稱
- 你看不到原始值
- 如果忘了，只能覆蓋成新的

這是正常的安全設計，不是壞掉。

---

## 17. 現在有哪些最重要的 Secrets

你目前最重要的 secrets / variables 是：

### Admin

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Acquaintance

- `ACQUAINTANCE_PASSWORD`

### 可選、但目前不建議日常使用

- `ADMIN_PASSWORD_HASH`
- `ACQUAINTANCE_PASSWORD_HASH`

它們可以存在，但你日常維護時最不容易搞錯的是直接用原始密碼版本：

- `ADMIN_PASSWORD`
- `ACQUAINTANCE_PASSWORD`

---

## 18. 現在 multiple passwords 是什麼狀態

這點一定要寫清楚，避免你之後混亂。

### 正式 Cloudflare 版

目前是：

- Admin：1 組帳號 + 1 組密碼
- Acquaintance：1 組密碼

### 舊靜態本地工具

[scripts/private-profile-passwords.mjs](C:/Users/User/Desktop/Blog/scripts/private-profile-passwords.mjs)

那套是以前舊的本地加密資料流程，可以做多組密碼，但不是現在正式網站的主流程。

### 實務結論

**現在正式網站請把它理解成不支援多組密碼。**

如果未來你真的要多組熟客密碼或多個管理者帳號，那是下一階段功能擴充，不是現在既有功能。

---

## 19. 目前最重要的檔案地圖

### 前台

- [index.html](C:/Users/User/Desktop/Blog/index.html)
- [style.css](C:/Users/User/Desktop/Blog/style.css)
- [app.js](C:/Users/User/Desktop/Blog/app.js)

### Studio

- [studio/index.html](C:/Users/User/Desktop/Blog/studio/index.html)
- [studio/studio.js](C:/Users/User/Desktop/Blog/studio/studio.js)
- [studio/studio.css](C:/Users/User/Desktop/Blog/studio/studio.css)

### 後端 API

- [functions/api/admin/login.js](C:/Users/User/Desktop/Blog/functions/api/admin/login.js)
- [functions/api/admin/session.js](C:/Users/User/Desktop/Blog/functions/api/admin/session.js)
- [functions/api/admin/bootstrap.js](C:/Users/User/Desktop/Blog/functions/api/admin/bootstrap.js)
- [functions/api/admin/translations.js](C:/Users/User/Desktop/Blog/functions/api/admin/translations.js)
- [functions/api/admin/updates.js](C:/Users/User/Desktop/Blog/functions/api/admin/updates.js)
- [functions/api/admin/posts.js](C:/Users/User/Desktop/Blog/functions/api/admin/posts.js)
- [functions/api/admin/private-profile.js](C:/Users/User/Desktop/Blog/functions/api/admin/private-profile.js)
- [functions/api/admin/private-profile-default.js](C:/Users/User/Desktop/Blog/functions/api/admin/private-profile-default.js)
- [functions/api/admin/reset.js](C:/Users/User/Desktop/Blog/functions/api/admin/reset.js)
- [functions/api/acquaintance/login.js](C:/Users/User/Desktop/Blog/functions/api/acquaintance/login.js)
- [functions/api/acquaintance/bootstrap.js](C:/Users/User/Desktop/Blog/functions/api/acquaintance/bootstrap.js)
- [functions/api/public/bootstrap.js](C:/Users/User/Desktop/Blog/functions/api/public/bootstrap.js)

### 共用邏輯

- [functions/_lib/auth.js](C:/Users/User/Desktop/Blog/functions/_lib/auth.js)
- [functions/_lib/db.js](C:/Users/User/Desktop/Blog/functions/_lib/db.js)
- [functions/_lib/default-cms-content.js](C:/Users/User/Desktop/Blog/functions/_lib/default-cms-content.js)
- [shared/markdown.mjs](C:/Users/User/Desktop/Blog/shared/markdown.mjs)

### Cloudflare 設定

- [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml)
- [cloudflare/schema.sql](C:/Users/User/Desktop/Blog/cloudflare/schema.sql)
- [_headers](C:/Users/User/Desktop/Blog/_headers)

### 其他文件

- [SITE_MAINTENANCE_MANUAL.md](C:/Users/User/Desktop/Blog/SITE_MAINTENANCE_MANUAL.md)
- [CLOUDFLARE_STUDIO_SETUP.md](C:/Users/User/Desktop/Blog/CLOUDFLARE_STUDIO_SETUP.md)
- [BLOG_PUBLISHING_GUIDE.md](C:/Users/User/Desktop/Blog/BLOG_PUBLISHING_GUIDE.md)
- [ACQUAINTANCE_MODE_PASSWORDS.md](C:/Users/User/Desktop/Blog/ACQUAINTANCE_MODE_PASSWORDS.md)

---

## 20. 今天實際做過的大事，按高層順序列一次

1. 整理原本靜態網站的內容與結構
2. 把首頁、文章、熟客模式、公私資料分界重新整理
3. 建立 GitHub repo 作為程式碼來源
4. 把網站接到 Cloudflare Pages
5. 建立 D1 資料庫 `jasonliao-cms`
6. 新增 `functions/`，讓網站有後端 API
7. 新增 `/studio/` 後台
8. 加入 admin 登入與 session
9. 加入熟客模式的 server-side 驗證
10. 把公開文案、updates、posts、熟客資料改成可存進 D1
11. 做出 reset 機制
12. 做出私人 baseline / reset default 機制
13. 做出 Markdown 發文編輯器與 live preview
14. 收緊隱私邊界，停用正式站上的舊 `private-data.js` 路徑
15. 對 Studio、API、熟客內容加上 noindex / no-store 與 session hardening

---

## 21. 為什麼現在既能被 Google 搜得到，又能有後台

這次的策略不是把整站藏起來，而是把網站分成兩層：

### 公開前台

- 可以被搜尋
- 可以保留你的公開形象與文章

### 後台與管理 API

- `/studio/`
- `/api/*`

這些不應該被搜尋，所以透過 header 設定成：

- `X-Robots-Tag: noindex, nofollow`
- `Cache-Control: no-store`

### 熟客內容

熟客內容也不是直接公開給 Google，而是要經過 session 驗證後才回傳。

---

## 22. GitHub Pages 和 Cloudflare Pages 現在的差別

這個很容易搞混。

### GitHub repo

GitHub 現在最重要的用途是：

- 保存程式碼
- 保存版本歷史
- 讓 Cloudflare 拉程式碼部署

### Cloudflare Pages

Cloudflare 才是現在這個「有 Studio、有 API、有 D1」的正式運作版本。

### 實務上你要記住

Studio 改的是 Cloudflare 版這條資料流，不是直接改 GitHub repo 裡的 HTML。

---

## 23. 哪些東西你之後通常不用管

以下大多時候可以放心不用管：

- 多數 Git 分支
- `compatibility_date`
- `database_id`
- `_headers`
- `cloudflare/schema.sql`
- `functions/_lib/*`
- `CMS_DB` binding

它們都是基礎架構。

只要沒有明確的 build error 或功能擴充需求，平常不要碰。

---

## 24. 哪些東西你之後真正會常用

### 日常內容維護

用 Studio：

- 改首頁文案
- 改 updates
- 發文章
- 改熟客資料
- reset

### 工程級改動

回本地 repo + GitHub：

- 改排版
- 改 CSS
- 改動畫
- 改前端邏輯
- 改 Studio 功能
- 改 API

---

## 25. 什麼情況代表你該回 GitHub，不是繼續在 Studio 裡找

如果你要的是下面這些，就不是 Studio 的工作：

- 我要把卡片版面改掉
- 我要把動態效果改掉
- 我要改按鈕樣式
- 我要多一個後台功能
- 我要改資料結構
- 我要支援多組熟客密碼
- 我要改文章編輯器

這些都屬於程式改動，要回 GitHub repo。

---

## 26. 什麼情況代表你不該去碰 GitHub

如果你只是：

- 改首頁文字
- 改最新動態
- 發一篇新文章
- 改熟客模式聯絡資訊
- 換熟客照片
- 調整熟客模式文案

那你應該優先去 Studio，而不是手改 HTML。

---

## 27. 未來如果你換電腦，怎麼重新接回來

高層順序如下：

1. 把 repo clone 下來
2. 確認 `main` 是最新
3. 確認 Cloudflare 專案仍然存在
4. 確認 D1 仍綁在 `CMS_DB`
5. 確認 Cloudflare 的 secrets 還在
6. 打開 Studio 測登入

如果只是換電腦，但 Cloudflare 專案和 D1 都還在，通常不用重建整套系統。

---

## 28. 真正要記住的最終版本

把它記成下面這樣就可以了：

### GitHub 是什麼

你的程式碼與版本歷史。

### Cloudflare 是什麼

讓網站有：

- 部署
- 後端
- 資料庫
- 後台

### Studio 是什麼

你日常改網站內容的地方。

### D1 是什麼

Studio 改出來的內容存放處。

### 為什麼靜態站能變成可登入的 CMS

因為我們不是只靠靜態檔，而是額外加了：

- Functions
- D1
- Studio

---

## 29. 這份文件之後怎麼用

當你忘記下面這些問題時，就回來看這份：

- 為什麼這個網站現在可以有 Studio
- 為什麼 GitHub 改程式，Studio 改內容
- 為什麼 Cloudflare Secret 看不到原值
- 為什麼有時要看 Deployments
- 為什麼 branch / commit / compatibility date 出現時不必太驚慌
- 為什麼不需要一台電腦永遠開著（→ 第 31 節）
- 如何加駕駛網站或教授網站（→ 第 32 節）
- 競賽網站和有互動登入的網站有什麼差別（→ 第 33、34 節）

如果你是要實際操作，請再看：

- [SITE_MAINTENANCE_MANUAL.md](C:/Users/User/Desktop/Blog/SITE_MAINTENANCE_MANUAL.md)

---

## 30. 建立任何一個新網站，最基礎的架構是什麼

想清楚一個問題：網站本質上是什麼？

### 最簡單的回答

網站就是：

- 有一些檔案（HTML、CSS、JavaScript、圖片）
- 放在某個可以被外界連上的地方
- 有人在瀏覽器輸入網址，就能看到那些檔案顯示出來

### 一個最小的網站需要什麼

| 東西 | 用途 |
|------|------|
| `index.html` | 頁面本身的結構與文字 |
| `style.css` | 版面、顏色、字體、排版 |
| `script.js` | 互動效果、動畫、行為 |
| 圖片 / 影片 | 視覺素材 |
| 「伺服器」或「靜態平台」 | 把上面這些檔案對外公開 |

### 這些東西分別叫什麼

- `index.html`：**HTML（結構）**
- `style.css`：**CSS（樣式）**
- `script.js`：**JavaScript（行為）**
- 伺服器或平台：**Hosting（託管）**

### 你的網站有沒有這些

有，而且都在 GitHub repo 裡：

- `index.html` → 首頁結構
- `style.css` → 版面與樣式
- `app.js` → 前端互動邏輯
- Cloudflare Pages → 把這些對外公開的 Hosting

---

## 31. 為什麼你的網站不需要一台電腦永遠開著

這是很多人剛開始搞不清楚的。

### 傳統自架伺服器的邏輯

很早以前，如果你要架一個網站，做法是：

1. 準備一台電腦
2. 安裝伺服器軟體（例如 Apache 或 Nginx）
3. 把你的網站檔案放進去
4. 這台電腦一定要 24 小時開著、插著網路
5. 有人連上你的 IP，伺服器才會回應

所以你會聽到「那台電腦要一直開著」，因為一旦關掉，網站就斷了。

這台電腦就叫做你的**伺服器（Server）**。

費用可能包含：

- 電費
- 網路費
- 硬體費用
- 維護成本

### 後來出現了「租用伺服器」

如果你不想自己買設備，可以租用：

- VPS（Virtual Private Server，虛擬私有伺服器）
- 雲端主機（例如 AWS EC2、GCP、Azure、DigitalOcean）

這些服務商幫你把伺服器開著，你只要付月費。

但你仍然需要：

- 管伺服器
- 管作業系統
- 管安全更新
- 管備份
- 管掛掉時怎麼辦

### 你的網站為什麼不需要這些

因為你的網站是**靜態網站（Static Site）**，加上用的是 **Cloudflare Pages**。

#### 靜態網站

靜態網站的意思是：

- 你的網站檔案是固定的
- 每個人來訪，伺服器都只是把相同的檔案給他
- 不需要伺服器「即時產生」任何東西

這種情況下，你不需要一台「每秒都在思考、在跑程式」的電腦。

你只需要一個能「儲存並傳遞檔案」的地方。

#### Cloudflare Pages 做了什麼

Cloudflare Pages 本質上是：

- Cloudflare 已經在全球建好了幾百台伺服器（CDN 邊緣節點）
- 你把網站檔案交給他們
- 他們幫你複製到全球各地的節點
- 有人來訪時，最近的節點直接回應

Cloudflare 的伺服器是他們自己在養著。

你不需要自己養。

你只需要「上傳你的程式碼到 GitHub，讓 Cloudflare 去抓並部署」。

這就是為什麼你不用有一台「一直開著的電腦」。

### 用表格比較

| 做法 | 你的電腦要開著嗎 | 費用 | 複雜度 |
|------|----------------|------|--------|
| 自架實體伺服器 | 要 | 高（電費＋設備） | 高 |
| 租用 VPS/雲端主機 | 不用（但付月費給服務商） | 中至高 | 中 |
| GitHub Pages / Cloudflare Pages | 完全不用 | 免費（基礎使用） | 低 |

### 那你的網站現在有後端，為什麼還不用開著電腦

因為你用的是 **Cloudflare Pages Functions**。

這是「無伺服器（Serverless）」架構。

意思是：

- 你的後端程式（`functions/`）也是部署在 Cloudflare 的基礎設施上
- 只有當有人發請求時，Cloudflare 才會啟動一個短暫的執行環境去執行
- 沒有請求時，什麼都不跑，什麼都不開著

這樣你就不需要自己養一台永遠在跑的後端伺服器。

---

## 32. 如何在這套系統上加入駕駛網站或教授網站

「加一個駕駛網站」或「加一個教授網站」，通常有以下幾種情境，做法不同。

### 情境 A：幫某個特定人（例如某位教授或賽車手）建一個**全新的獨立網站**

如果是完全獨立的網站，做法跟你自己建這個網站一樣：

1. 在 GitHub 建一個新 repo（例如 `prof-chen-site`）
2. 把新網站的 HTML / CSS / JS 放進去
3. 在 Cloudflare 建一個新的 Pages 專案
4. 把這個新的 Pages 專案連到那個 GitHub repo
5. 設好網域（例如 `profchen.com` 或用 Cloudflare 給的子網域）
6. 完成

這樣就是一個完全獨立的網站，跟你的個人網站完全分開。

如果那個網站需要登入、後台、資料庫，就依照這個網站的模式，額外加：

- `functions/`（後端 API）
- D1 資料庫
- Studio 後台（或自己設計管理介面）

### 情境 B：在**你現有的網站**裡加一個新的「駕駛頁面」或「教授頁面」

如果是在你自己的網站裡，新增一個關於駕駛、賽車或教授的介紹頁面，做法是：

1. 在 repo 根目錄或 `posts/` 資料夾新增一個 HTML 檔

   例如：

   ```text
   posts/racing-driver.html
   ```

   或：

   ```text
   posts/prof-chen.html
   ```

2. 在 `index.html` 或文章列表裡加一個連結指向這個新頁面

3. 按照這個網站的風格設計頁面樣式（引用 `style.css`）

4. `git add .`、`git commit -m "add racing driver page"`、`git push origin main`

5. Cloudflare 自動部署，頁面上線

### 情境 C：透過 Studio 的 CMS 管理文章系統發一篇駕駛或教授的文章

如果不是獨立頁面，只是一篇文章：

1. 登入 Studio
2. 進 `Posts`
3. 填好 Slug（例如 `racing-driver-intro`）
4. 寫好內容
5. 按 `Save Post`

這樣就會有一個對應 URL 的文章頁面。

### 三種方式的差異

| 做法 | 適合情境 | 需要改程式嗎 |
|------|---------|------------|
| 全新獨立網站 | 完全獨立的個人或機構網站 | 是（建新 repo） |
| 在現有網站加 HTML 頁面 | 在自己網站加一個主題頁 | 是（改 repo） |
| 透過 Studio 發文章 | 快速新增一篇主題文章 | 否（Studio 操作） |

---

## 33. 靜態個人網站、競賽網站、有互動登入的網站有什麼差別

這三種網站的核心差異在於：**它需不需要伺服器即時處理事情**。

### 靜態個人網站（Static Personal Site）

**你現有的網站原本就是這類。**

特徵：

- 所有頁面都是預先寫好的 HTML 檔
- 訪客打開時，伺服器只是把文件傳給他
- 不需要伺服器動態計算任何東西
- 不需要資料庫（或可以不用）
- 速度非常快
- 維護成本低
- 適合：個人作品集、部落格、個人介紹、靜態文件網站

**例子：**

- 個人網站
- 學術個人頁
- 靜態部落格（Hugo、Jekyll）

---

### 競賽網站（Competition / Event Site）

競賽網站通常指：

- 賽事活動的介紹頁（例如某場機器人競賽、田徑錦標賽、棒球賽事）
- 公告賽程、賽果、規則、報名說明

這類網站分兩種：

#### 純靜態競賽網站

特徵：

- 主辦方手動更新賽果、賽程
- 每次更新要改 HTML 或用 CMS 更新
- 不需要登入
- 不需要帳號系統
- 適合：一次性活動、小型賽事

---

#### 有互動功能的競賽網站

特徵：

- 線上報名（需要資料庫存參賽者）
- 即時賽果更新（需要後端寫入 DB）
- 隊伍帳號登入（需要帳號系統）
- 積分排名（需要動態計算）
- 需要真正的後端 + 資料庫

---

### 有互動功能、可登入的網站（Dynamic / Interactive Site）

這是功能最複雜的一類。

特徵：

- 使用者可以**建立帳號、登入、登出**
- 不同使用者看到不同內容（個人化）
- 資料是即時的（你發文，別人馬上看到）
- 需要**後端伺服器**（處理請求）
- 需要**資料庫**（存帳號、存內容、存交易）
- 有時需要**身份驗證服務**（JWT、OAuth 等）

**例子：**

- Facebook、Instagram（社群平台）
- GitHub（程式碼協作平台）
- Google Docs（即時協作文件）
- 線上購物網站（購物車、訂單、付款）
- 學校的選課系統
- 論壇（PTT、Dcard）

---

### 用表格完整比較三類

| 功能 | 靜態個人網站 | 靜態競賽網站 | 動態互動網站 |
|------|------------|------------|------------|
| 使用者帳號登入 | 無（或很簡單） | 通常無 | 有 |
| 資料庫 | 無（或輕量） | 通常無 | 必須有 |
| 後端伺服器 | 無 | 無 | 必須有 |
| 即時資料更新 | 否 | 部分 | 是 |
| 個人化內容 | 否 | 否 | 是 |
| 建置複雜度 | 低 | 低至中 | 高 |
| 維護成本 | 低 | 低至中 | 高 |
| 適合對象 | 個人、小型品牌 | 賽事活動主辦方 | 平台、社群、服務 |

---

### 你的網站現在是哪一類

你的網站是「靜態個人網站 + 輕量後端」的組合。

- 前台對訪客來說是靜態體驗（速度快、不需要帳號）
- 後台（Studio + Functions + D1）讓你有一個管理員專用的登入入口
- 訪客不需要帳號
- 你（管理員）才需要登入

這是比純靜態更強、但比完整動態平台更輕的折衷方案。

---

## 34. 建置不同類型網站需要哪些技術

如果你之後想幫別人（例如教授、賽車手、賽事主辦方）建網站，或者想知道不同類型網站需要什麼技術，可以參考下面這張地圖。

### 純靜態個人/介紹網站

需要：

- HTML、CSS、JavaScript（基礎三件套）
- GitHub 存程式碼
- Cloudflare Pages 或 GitHub Pages 部署

不需要：

- 後端
- 資料庫
- 帳號系統

---

### 靜態競賽活動網站

需要：

- 同上，再加：
- 清楚的版面設計（賽程表、規則、聯絡方式）
- 可選：連結到外部報名系統（Google Form、Accupass 等）

---

### 有 CMS 的內容網站（類似你現在的網站）

需要：

- HTML / CSS / JS（前台）
- 後端 Functions（如 Cloudflare Functions、Netlify Functions、Vercel Functions）
- 輕量資料庫（如 Cloudflare D1、PlanetScale、Supabase）
- 後台管理介面（Studio 或其他 CMS）

---

### 完整登入功能的互動網站

需要：

- 前端框架（React、Vue、Next.js 等）
- 後端伺服器（Node.js、Python/Django、Ruby on Rails 等）
- 資料庫（PostgreSQL、MySQL、MongoDB 等）
- 帳號系統（JWT、OAuth、Auth0 等身份驗證）
- Hosting（AWS、GCP、Heroku、Render、Fly.io 等）

---

### 一句話總結

| 類型 | 核心需求 |
|------|---------|
| 靜態個人/活動網站 | HTML + CSS + 靜態 Hosting |
| 有 CMS 管理的網站 | 靜態前台 + Serverless 後端 + 輕量 DB |
| 完整互動平台 | 前端框架 + 後端伺服器 + 完整 DB + 帳號系統 |

你目前這套剛好是第二類，算是兼顧了「夠簡單、能維護」與「有一定後端能力」的折衷方案。

