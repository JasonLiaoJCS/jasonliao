# Site Maintenance Manual

這份文件是給「之後實際管理這個網站的人」看的。

它的目標不是解釋整個架構原理，而是讓你之後真的可以自己維護網站，不用每次都重新摸索。

它會回答這些最實際的問題：

- 我平常到底去哪裡改東西
- 我怎麼發文
- 我怎麼改首頁文字
- 我怎麼改熟客模式
- 我怎麼改密碼
- 我改壞了怎麼救
- 哪些東西我不用管
- 哪些東西我最好不要亂動

如果你想看整體架構原理，請看：

- [HOW_THIS_SITE_WAS_BUILT.md](C:/Users/User/Desktop/Blog/HOW_THIS_SITE_WAS_BUILT.md)

---

## 1. 先記住最重要的分工

### A. 改內容：去 Studio

Studio 處理的是：

- 首頁公開文案
- 熟客模式資料
- 最新 updates
- CMS 管理的 posts / notes

### B. 改程式：才回 GitHub

只有你要改下面這些東西時，才要碰 GitHub / 本地 repo：

- 網站排版
- CSS
- 動畫
- 前端邏輯
- Studio 功能
- 後端 API
- 資料結構

### 最重要的一句話

**日常維護看 Studio，工程級修改才看 GitHub。**

---

## 2. 你平常最常用的網址

### Studio 後台

```text
https://jasonliao-pages.pages.dev/studio/
```

### Cloudflare 專案

```text
Cloudflare Dashboard -> Workers & Pages -> jasonliao-pages
```

### GitHub repo

```text
https://github.com/JasonLiaoJCS/jasonliao
```

---

## 3. Studio 現在怎麼登入

目前後台登入用的是 Cloudflare secrets。

你平常最重要的是這三個：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### 目前建議的理解方式

- Username：你自己在 Cloudflare 設的帳號名
- Password：你自己在 Cloudflare 設的原始密碼

### 你現在應該怎麼想

以後登入後台，請把它理解成「登入網站管理員帳號」，不是去處理 hash。

也就是說，日常使用時：

- 你輸入的是普通密碼
- 不是 `pbkdf2_sha256$...`

---

## 4. Studio 的登入保護現在是什麼行為

目前 Studio 這邊的保護邏輯是：

- 新開一個 Studio 分頁，預設要重新登入
- 重開瀏覽器後，預設要重新登入
- 閒置 10 分鐘會自動登出
- Studio 頁面與 API 不應被搜尋引擎收錄

### 你要怎麼理解它

它不是像某些社群平台那樣永遠幫你記住登入狀態。

你可以把它理解成：

- 一次工作階段登入
- 過一陣子或重新開頁，就再登入一次

這對你的隱私與後台安全是比較好的。

---

## 5. 如果我改了 Cloudflare Secret，但還是登不進去，先怎麼查

先不要慌，照這個順序查：

1. 確認你改的是正確專案：`jasonliao-pages`
2. 確認你改的是 `ADMIN_PASSWORD`，不是別的欄位
3. 去 Cloudflare `Deployments` 看最新部署是不是 `Success`
4. 開無痕視窗
5. 打開 `/studio/`
6. 按 `Ctrl + F5`
7. 再試一次

### 最常見的錯誤不是密碼本身，而是：

- 改完 secret 沒重新部署
- 看的是舊 deployment
- 瀏覽器快取還沒刷新

---

## 6. Secret 有一個很重要的規則

Cloudflare 的 Secret 一旦存進去，原始值通常不會再顯示。

也就是說：

- 你看得到名稱
- 你看不到內容
- 如果忘了，只能直接覆蓋成新的

所以之後請習慣這件事：

### 忘記密碼或不確定密碼時，做法不是「查出來」

而是：

1. 直接把那個 secret 改成新值
2. 重新部署
3. 用新值登入

---

## 7. Studio 裡每一區是做什麼的

### 7.1 Dashboard

用途：

- 看目前有幾筆 updates
- 看有幾篇 managed posts
- 看熟客資料是不是已經設好

它主要是總覽，不是主要編輯區。

### 7.2 Public Copy

用途：

- 改首頁公開版文案

通常可改的包括：

- Hero 自介
- About 文案
- Profile Snapshot 幾段敘述
- Focus / 課題區塊
- Contact 文案
- Footer motto

改完按：

```text
Save Public Copy
```

### 7.3 Updates

用途：

- 管理首頁最近動態

你可以：

- 新增 update
- 排順序
- 設定公開 / 熟客可見
- 編輯中英文
- 刪除某筆

改完按：

```text
Save Updates
```

### 7.4 Posts

用途：

- 發 blog / notes

主要欄位有：

- `Slug`
- `Visibility`
- `Status`
- `Publish Time（自動）`
- 中文標題
- 英文標題
- 中文摘要
- 英文摘要
- 中文內容
- 英文內容
- `Tags`
- `Cover Image`
- `Cover Alt`

這一區現在另外有幾個很實用的工作流功能：

- `Add Photos`
  - 支援 `PNG / JPG / JPEG`
  - 可一次插入多張文章圖片
- `Preview Draft`
  - 先看草稿頁面長什麼樣
- 本機 autosave
  - 關頁前、切文章前、閒置時會自動存成 local draft
- `Discard Local Draft`
  - 把尚未正式儲存到網站的本機草稿丟掉
- 發布前 checklist
  - 欄位沒補齊時，`Published` 會被擋下來
- 自動發布時間
  - 第一次正式發布時，系統會自動記下當下時間
  - 不需要手動選日期

另外，首頁 Blog 的「本期主打 / Featured」現在是依照**最新發布時間**自動挑選，不是手動指定。

### 7.5 Acquaintance Profile

用途：

- 管熟客模式資料

可以改：

- Email
- Phone
- Instagram
- 熟客模式導言
- 熟客模式下的 Hero / About / 學經歷等私密版文案
- 熟客照片
  - 可上傳
  - 可移除舊照片後再儲存

改完按：

```text
Save Acquaintance Profile
```

### 7.6 Deploy

用途：

- 做整體 reset

這裡有一個大重置：

```text
Reset Entire CMS
```

這個按鈕很強，不要亂按。

---

## 8. 最常見的 6 種操作

### 操作 1：改首頁公開文案

步驟：

1. 登入 Studio
2. 進 `Public Copy`
3. 找到要改的欄位
4. 改中文 / 英文
5. 按 `Save Public Copy`
6. 到前台重新整理確認

### 操作 2：新增一則首頁最新動態

步驟：

1. 登入 Studio
2. 進 `Updates`
3. 新增一筆
4. 填日期、中文、英文
5. 選 `Public` 或 `Acquaintance`
6. 按 `Save Updates`
7. 到首頁看顯示是否正確

### 操作 3：發一篇公開文章

步驟：

1. 登入 Studio
2. 進 `Posts`
3. 按 `New Post`
4. 填 `Slug`
5. `Visibility` 選 `Public`
6. `Status` 選 `Draft` 或 `Published`
7. 填標題、摘要、內容
8. 如果要放封面，填 `Cover Image` 或直接上傳封面圖
9. 如果要放文章配圖，用 `Add Photos`
10. 先按 `Preview Draft` 看版面
11. 按 `Save Post`
12. 用 `Open Current URL` 或直接打網址確認

### 操作 4：發一篇只有熟客能看的文章

步驟：

1. 登入 Studio
2. 進 `Posts`
3. 按 `New Post`
4. 填 `Slug`
5. `Visibility` 選 `Acquaintance`
6. `Status` 選 `Draft` 或 `Published`
7. 填文章內容
8. 如需要可加入封面圖與文章圖片
9. 先按 `Preview Draft`
10. 按 `Save Post`

這種文章正式路徑一樣會是：

```text
/notes/<slug>
```

但沒解鎖熟客模式的人只會看到鎖定頁，不會直接看到全文。

### 操作 5：更新熟客模式聯絡方式與照片

步驟：

1. 登入 Studio
2. 進 `Acquaintance Profile`
3. 改 Email / Phone / Instagram
4. 上傳照片，或按 `Remove Image` 清掉舊照片
5. 改熟客文案
6. 按 `Save Acquaintance Profile`

### 操作 6：把目前熟客資料存成新的 reset 預設

這個功能很重要。

因為現在熟客模式的「預設值」不是寫在公開 repo 裡，而是存在 D1 的私人 baseline。

步驟：

1. 進 `Acquaintance Profile`
2. 先把內容改到你滿意
3. 先按 `Save Acquaintance Profile`
4. 再按：

```text
Save as Reset Default
```

這樣之後如果你按 `Reset to Default`，就會回到你自己保存的那份熟客預設，而不是空白模板。

---

## 9. `Save`、`Draft`、`Published`、`Public`、`Acquaintance` 到底差在哪

### `Save`

表示把目前表單內容正式寫進 Cloudflare D1。

如果你沒按 `Save`：

- 網站正式內容不會更新
- 但 `Posts` 很可能已經被 autosave 成本機草稿
- 下次打開 Studio 時，草稿可能會自動恢復

### `Draft`

文章是草稿。

### `Published`

文章正式發布。

### `Public`

所有人都能看。

### `Acquaintance`

只有熟客模式解鎖後才能看。

---

## 10. 文章系統現在怎麼寫

### 目前用的是 Markdown 編輯器 + 即時預覽 + 本機草稿工作流

也就是：

- 你不用再手打原始 HTML
- 你可以直接寫 Markdown
- Studio 右邊會有 live preview
- 工具列可快速插入常用格式
- 可以插入文章圖片
- 可以加封面圖
- 可以預覽草稿頁面
- 會自動存本機草稿

### 你可以直接這樣寫

```md
## 小標題

這是第一段。

- 第一點
- 第二點

這是 **重點**，這是 [連結](https://example.com)。
```

### 要注意的事

- 新文章建議直接用 Markdown
- 以前已經存在的 HTML 文章仍然相容，不會直接壞掉
- Studio 不是 Word，也不是 Notion
- 目前是 Markdown editor，不是完整所見即所得 WYSIWYG

### 圖片目前怎麼用

- 文章內插圖目前支援：
  - `PNG / JPG / JPEG`
- 封面圖也支援：
  - 貼 URL
  - 或直接上傳 `PNG / JPG / JPEG`
- 文章圖片與封面圖目前不是獨立圖床
  - 它們會跟文章內容一起存在 D1
  - 不會進 GitHub repo

### 圖片刪掉後，資源會不會殘留

- 文章內圖片：
  - 先從編輯器刪掉圖片標記
  - 再按 `Save Post`
  - 這樣該篇文章裡不再被引用的圖片資料就會一起被清掉
- 封面圖：
  - 按 `Remove Cover`
  - 再按 `Save Post`
  - 封面資料就會從文章裡移除
- 熟客照片：
  - 按 `Remove Image`
  - 再按 `Save Acquaintance Profile`
  - 該張照片就會從熟客資料裡清掉

### 本機草稿會不會越存越大

- 本機 autosave 只存在你自己的瀏覽器 `localStorage`
- 不會進 GitHub
- 不會變成獨立 Cloudflare 圖片資源
- Studio 現在已經有自動清理機制
  - 太舊的草稿會清掉
  - 已和正式版本一致的草稿會清掉
  - 超過保留上限的最舊草稿也會清掉

---

## 11. 如果我改得不滿意，怎麼回復

### 情況 A：還沒按 Save

現在不能再單純理解成「重整就一定沒了」。

因為 `Posts` 會自動做本機 autosave，所以：

- 重新整理後，草稿可能還會被恢復
- 關分頁前也可能已經先被本機保存

如果你想真的丟掉目前這份未正式發佈的文章草稿，請按：

```text
Discard Local Draft
```

### 情況 B：已經按 Save

#### Public Copy

按：

```text
Reset to Default
```

#### Updates

按：

```text
Reset Updates
```

#### Acquaintance Profile

按：

```text
Reset to Default
```

### 如果我想整個 CMS 回到初始狀態

去 `Deploy` 區，按：

```text
Reset Entire CMS
```

### 這顆按鈕會做什麼

- 公開文案回預設
- updates 回預設
- 熟客資料回預設
- CMS managed posts 清空

所以按之前一定要看清楚。

---

## 12. 熟客模式現在該怎麼理解

你現在要把它理解成：

- 公開模式：只顯示公開版文案
- 熟客模式：解鎖後才顯示較完整的私密資料與私密版文案

### 你要注意的一點

熟客模式下，不是只有那個「熟客資訊卡」會變。

在現在這套 Cloudflare 版設計裡，熟客模式可以覆蓋的不只是聯絡方式，還包含：

- Hero 的部分文案
- About 的部分文案
- 學經歷區塊
- 某些個人背景 / 課題描述
- 熟客照片

所以如果你覺得「切到熟客模式，怎麼只有某一小塊變了」，那通常表示私密文案欄位沒有設完整，或還沒儲存成 baseline。

---

## 13. 之後怎麼改後台登入密碼

### 改 Admin 密碼

去：

```text
Cloudflare -> jasonliao-pages -> Settings -> Variables and Secrets
```

找到：

- `ADMIN_PASSWORD`

把它直接改成新值。

### 改完之後一定要做的事

1. 儲存
2. 去 `Deployments`
3. 重新部署一次
4. 開無痕視窗測登入

---

## 14. 之後怎麼改熟客模式密碼

在同一個地方改：

- `ACQUAINTANCE_PASSWORD`

改完後同樣：

1. 儲存
2. 重新部署
3. 到前台重新測熟客模式

---

## 15. 還要不要碰 `ADMIN_PASSWORD_HASH` / `ACQUAINTANCE_PASSWORD_HASH`

平常不用。

目前最直觀、最不容易出錯的流程是：

- `ADMIN_PASSWORD`
- `ACQUAINTANCE_PASSWORD`

### 你可以這樣理解

這兩個 hash 欄位現在屬於：

- 相容
- 備用
- 不是日常維護主流程

如果你不是在做特別的安全流程，不要再把自己搞進 hash 地獄。

---

## 16. 可不可以同時有兩組以上密碼

### Admin

目前不支援。

### Cloudflare 正式熟客模式

目前也不支援。

### 以前為什麼你會有「好像有多組密碼還在生效」的印象

因為更早以前有一套舊的靜態本地加密流程，可支援多組密碼。

但那不是現在正式站的主流程，而且正式站上那條舊路線已經被停用。

### 實務結論

請把現在正式站理解成：

- Admin：1 組
- Acquaintance：1 組

如果未來真的要多組密碼，那是下一階段功能擴充，不是現在已內建的功能。

---

## 17. 什麼時候要用 GitHub

只有你要改「程式本身」時，才需要 GitHub。

例如：

- 換版型
- 換 CSS
- 改動畫
- 改前端邏輯
- 改 Studio 功能
- 改文章頁長相
- 改後台能力
- 改資料結構

這時你才需要本地 repo + Git：

```powershell
git status
git add .
git commit -m "your message"
git push origin main
```

推上去後，Cloudflare 才會重新部署。

---

## 18. 什麼時候完全不用 GitHub

如果你只是：

- 改首頁公開文案
- 發一篇 CMS 文章
- 改一則 update
- 改熟客聯絡方式
- 換熟客照片
- 改熟客版文案

那你應該只用 Studio。

這些操作不需要碰 GitHub。

---

## 19. branch 到底要不要管

大多數情況下：

**不用。**

你現在最重要的是：

- GitHub `main`
- Cloudflare production 追蹤的也是 `main`

所以平常不要被 branch 搞亂。

只有在做程式開發時，Git branch 才比較重要。

如果你只是維護網站內容，幾乎可以忽略它。

---

## 20. 什麼東西你不要亂動

以下這些東西，平常請不要亂改：

- [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml)
- `database_id`
- `compatibility_date`
- Cloudflare `Bindings` 裡的 `CMS_DB`
- [cloudflare/schema.sql](C:/Users/User/Desktop/Blog/cloudflare/schema.sql)
- [_headers](C:/Users/User/Desktop/Blog/_headers)
- `functions/_lib/*`

### 為什麼

因為這些不是內容，是基礎架構。

亂動之後可能造成：

- Studio 登不進去
- D1 讀不到
- API 壞掉
- 部署失敗
- 熟客模式失效

---

## 21. 什麼東西你可以放心不用管

平常大多數時候，你可以放心不用管：

- `compatibility_date`
- D1 table 結構
- `_headers`
- API 路徑細節
- Git 多分支
- `database_id`

### 你平常真的只要會：

- 登入 Studio
- 改內容
- 按 Save
- 必要時 Reset
- 如果是程式問題，再去看 Cloudflare Deployments

就夠了。

---

## 22. 如果網站怪怪的，先怎麼查

### 情況 1：Studio 看起來還是舊版

先做：

1. 去 Cloudflare `Deployments`
2. 確認最新 deployment 是 `Success`
3. 開無痕視窗
4. `Ctrl + F5`

### 情況 2：我明明改了密碼還是登不進去

先做：

1. 確認改的是 `jasonliao-pages` 這個專案
2. 確認改的是 `ADMIN_PASSWORD`
3. 重新部署
4. 用無痕視窗重試

### 情況 3：前台內容沒變

先確認你現在打開的是：

- Cloudflare 版網址
  還是
- 別的舊網址

因為 Studio 改的是 Cloudflare 版資料流。

### 情況 4：熟客模式看起來怪怪的

先分三件事檢查：

1. 熟客模式有沒有真的解鎖成功
2. `Acquaintance Profile` 裡的內容有沒有真的 `Save`
3. 你有沒有把目前那版存成 `Save as Reset Default`

---

## 23. 最健康的維護習慣

### 好習慣

1. 日常只在 Studio 改內容
2. 每次改完立即到前台確認
3. 改密碼後立刻重新部署並用無痕測
4. 密碼記在自己的密碼管理器
5. 程式改動才走 GitHub
6. 看到網站怪怪的，先看 Cloudflare deployment，不要先亂改設定

### 壞習慣

1. 一邊改 Studio，一邊手改同一段 HTML
2. 不看 deployment 就一直刷新
3. 改錯專案的 secret
4. 把 secret 當一般變數亂改
5. 亂碰 `wrangler.toml`
6. 以為熟客模式密碼還能沿用舊靜態本地工具那套多密碼邏輯

---

## 24. 我之後要怎麼做一次正常的內容更新

### 範例 A：改首頁一句話

1. Studio 登入
2. `Public Copy`
3. 找到欄位
4. 改字
5. `Save Public Copy`
6. 打開首頁確認

### 範例 B：發一篇公開文章

1. Studio 登入
2. `Posts`
3. `New Post`
4. 填 `Slug`
5. `Visibility = Public`
6. `Status = Published`
7. 用 Markdown 寫內容
8. `Save Post`
9. 打開網址確認

### 範例 C：更新熟客模式資料

1. Studio 登入
2. `Acquaintance Profile`
3. 改內容
4. `Save Acquaintance Profile`
5. 如果這版就是你之後想保留的預設，再按 `Save as Reset Default`
6. 用熟客模式重新解鎖首頁驗證

---

## 25. 什麼時候需要找工程層協助，而不是繼續自己在 Studio 裡試

如果你要的是這些，就應該回到程式層：

- 我要新增一個新的 Studio 功能
- 我要改熟客模式邏輯
- 我要改文章系統結構
- 我要支援多組熟客密碼
- 我要加新的 API
- 我要讓前台某個區塊切換邏輯變更
- 我要換整體設計風格

也就是說，Studio 是內容管理工具，不是萬能網站建構器。

---

## 26. 這份手冊最後要你記住的 8 句話

1. 改內容去 Studio。
2. 改程式才去 GitHub。
3. 改密碼要去 Cloudflare Secrets。
4. 改完 Secret 要重新部署。
5. 看起來像舊版時，先查 Deployments。
6. 熟客模式不是只有一塊會切換，私密文案可以覆蓋多個區塊。
7. 現在正式站的密碼邏輯是單一密碼，不要再混舊的多密碼本地流程。
8. 不確定時，先不要亂動 `wrangler.toml`、D1、Bindings、_headers。
