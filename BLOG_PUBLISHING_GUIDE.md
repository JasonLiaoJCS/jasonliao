# Blog Publishing Guide

這份文件說明你現在應該怎麼發布文章、更新文章、插入圖片，以及哪些流程還是舊的 fallback。

## 0. 先看最重要的一句話

現在這個網站的文章有兩條路：

- `Studio / CMS managed posts`
  - 這是現在的主流程
  - 文章存在 Cloudflare D1
  - 正式網址走 `/notes/<slug>`
- `posts/*.html`
  - 這是舊的靜態 fallback
  - 還能用，但已不是主要發文方式

如果你是在正常經營網站、寫新文章，請優先用：

```text
/studio/
```

---

## 1. Studio 現在能做什麼

在 `Studio -> Posts` 裡，你現在可以直接：

- 新增公開文章
- 新增熟客限定文章
- 編輯已存在的 CMS 文章
- 寫中英文標題、摘要、內容
- 設定 `Draft / Published`
- 設定 `Public / Acquaintance`
- 上傳封面圖
- 用 `Add Photos` 插入文章圖片
- 即時預覽文章內容
- 用 `Preview Draft` 先看草稿頁
- 讓系統自動做本機 autosave

---

## 2. 文章目前分成哪幾種

### A. CMS 公開文章

這是現在最推薦的公開文章方式。

特點：

- 文章存在 Cloudflare D1
- 首頁 Blog 區會自動讀取
- 文章網址是：

```text
/notes/<slug>
```

- 任何人都能看

### B. CMS 熟客限定文章

這是現在正式可用的熟客限定文章方式。

特點：

- 文章同樣存在 Cloudflare D1
- `Visibility` 設成 `Acquaintance`
- 沒解鎖熟客模式的人，只會看到鎖定頁
- 解鎖後才會看到文章內容

### C. 舊靜態文章

這是 repo 裡原本的：

- `posts/reason-passion.html`
- `posts/math-robotics.html`
- `posts/baseball-engineering.html`

這些仍然可以繼續存在，但現在比較像：

- 舊文
- 靜態 fallback
- 需要自己手動維護 `index.html / feed.xml / sitemap.xml`

---

## 3. 如何在 Studio 發一篇公開文章

步驟：

1. 打開 `/studio/`
2. 登入後進 `Posts`
3. 按 `New Post`
4. 填 `Slug`
5. `Visibility` 選 `Public`
6. `Status` 選：
   - `Draft`：先存草稿
   - `Published`：直接上線
7. 不需要手動選發布日期
   - 第一次用 `Published` 正式保存時，Studio 會自動記下當下的發布時間
8. 填標題、摘要、內容
9. 如果需要封面，填 `Cover Image` 或上傳封面圖
10. 如果需要文章圖片，按 `Add Photos`
11. 先按 `Preview Draft`
12. 確認沒問題後按 `Save Post`
13. 用 `Open Current URL` 檢查正式頁面

---

## 4. 如何在 Studio 發一篇熟客限定文章

步驟和公開文章差不多，只差兩個欄位：

1. `Visibility` 選 `Acquaintance`
2. `Status` 選 `Draft` 或 `Published`

發布後的正式路徑仍然是：

```text
/notes/<slug>
```

差別在於：

- 沒解鎖熟客模式的人看不到全文
- 已解鎖的人才看得到內容

### 發布時間現在怎麼決定

- `Draft` 狀態下不用自己填日期
- 第一次正式變成 `Published` 時，後端會自動記下當下時間
- 之後再修改已發布文章，會保留原本發布時間，不會因為編輯就把它變成最新文章

### 首頁 Blog 主打文章現在怎麼判定

- 預設情況下，「本期主打 / Featured」會自動抓**最新發布**的那篇 CMS 文章
- 不是看最後編輯時間
- 所以只要新文章第一次正式發布，它就會立刻變成主打
- 你也可以在 `Studio -> Posts` 手動把某篇已發布文章設成主打
- 但只要之後又有另一篇文章第一次正式發布，主打會自動切回那篇最新發布的文章

---

## 5. 如何更新現有 CMS 文章

步驟：

1. 進 `Studio -> Posts`
2. 點左邊那篇文章
3. 直接改內容
4. 需要時先按 `Preview Draft`
5. 確認後按 `Save Post`

### 要注意

- `Posts` 現在有本機 autosave
- 所以你改到一半就關掉頁面，內容可能仍會在下次被恢復
- 如果你想把尚未正式儲存的本機草稿丟掉，請按：

```text
Discard Local Draft
```

---

## 6. 文章圖片與封面圖怎麼處理

### 文章內圖片

目前支援：

- `PNG`
- `JPG`
- `JPEG`

做法：

1. 把游標放到 Markdown 編輯區要插圖的位置
2. 按 `Add Photos`
3. 選圖片
4. 系統會把圖片插進文章內容並更新預覽

### 封面圖

封面圖可用兩種方式：

- 直接貼圖片 URL
- 直接上傳 `PNG / JPG / JPEG`

封面圖會用在：

- 首頁 Blog 主打卡
- 文章列表卡片
- `/notes/<slug>` 文章頁 hero

---

## 7. 圖片刪掉後，會不會殘留資源

目前的規則是：

- 文章圖片不是獨立圖床
- 封面圖也不是獨立圖床
- 它們會跟文章一起存在 D1
- 不會進 GitHub repo

### 如果你刪掉文章內圖片

1. 從編輯器把圖片標記刪掉
2. 按 `Save Post`

這樣那篇文章不再引用的圖片資料就會一起被清掉。

### 如果你刪掉封面圖

1. 按 `Remove Cover`
2. 按 `Save Post`

這樣封面資料就會從該篇文章移除。

### 如果你刪掉整篇文章

按 `Delete Post` 後，那篇文章和它的內容資料會一起從 D1 刪掉。

---

## 8. 本機 autosave 會不會越存越大

不會無限制成長。

現在的本機草稿：

- 只存在你的瀏覽器 `localStorage`
- 不會進 GitHub
- 不會變成 Cloudflare 的獨立圖片資源

而且 Studio 已經有自動清理：

- 太舊的草稿會清掉
- 已經和正式版本一致的草稿會清掉
- 超過保留上限的最舊草稿會清掉

---

## 9. 舊靜態文章流程現在還能不能用

可以，但它現在是備援方案，不是主流程。

如果你真的要走舊流程，才需要自己手動改：

- `posts/*.html`
- `index.html`
- `feed.xml`
- `sitemap.xml`

這條路比較適合：

- 維護舊文章
- 少量保留原本的靜態頁
- 你明確知道自己為什麼不用 Studio

---

## 10. `feed.xml` / `sitemap.xml` 現在要怎麼理解

目前 repo 裡的：

- `feed.xml`
- `sitemap.xml`

現在要分開理解：

- `sitemap.xml`
  - 正式 Cloudflare 站上的 `/sitemap.xml` 會由 Pages Functions 動態產生
  - 會自動包含所有公開且已發布的 `/notes/<slug>` 文章
  - 每篇公開 CMS 文章都會帶上對應的 `lastmod`
  - 熟客限定文章不會進 sitemap
- `feed.xml`
  - 目前仍主要對應舊的靜態文章 `posts/*.html`
  - 還沒有同步改成動態產生

### 這代表什麼

- 新的 CMS `/notes/<slug>` 文章會出現在首頁 Blog、文章頁，並且會自動進 `sitemap.xml`
- 但目前還**不會自動同步進** `feed.xml`

所以現在要這樣理解：

- `Studio / CMS`：現在的主發文流程
- `feed.xml`：目前仍是靜態 fallback 的 SEO 檔
- `sitemap.xml`：正式站已改成動態生成

---

## 11. 我建議你之後的發文習慣

### 真的在經營網站時

請優先用：

- `Studio -> Posts`

### 只有在這些情況下才碰靜態舊流程

- 維護舊的 `posts/*.html`
- 特別想保留某篇完全手寫的靜態頁
- 你知道目前只需要手動維護 `feed.xml`，`sitemap.xml` 已經會自動帶公開 CMS 文章

---

## 12. 簡短結論

### 你現在自己就能做的

- 用 Studio 發公開文章
- 用 Studio 發熟客限定文章
- 更新封面圖
- 插入文章圖片
- 預覽草稿
- 依靠 autosave 暫存進度
- 用 `Discard Local Draft` 丟掉未正式儲存的草稿

### 你現在不需要再把它想成什麼

- 不需要再把新文章主要想成 `posts/*.html`
- 不需要再把文章圖片想成 GitHub 檔案上傳
- 不需要再把熟客限定文章想成「還不能自己做」
