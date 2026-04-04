# Blog Publishing Guide

這份文件說明你之後要如何更新網站、發布新的 blog，以及目前公開文章和熟客限定文章的差別。

## 1. 目前網站的文章分成哪兩種

### 公開文章

公開文章就是現在 `posts/` 資料夾裡這三篇這種做法：

- `posts/reason-passion.html`
- `posts/math-robotics.html`
- `posts/baseball-engineering.html`

這種文章會：

- 被搜尋引擎看到
- 可以直接用網址打開
- 可以放進首頁卡片
- 可以放進 `feed.xml`
- 可以放進 `sitemap.xml`

### 熟客限定文章

如果你希望文章只有熟客可以看，就**不能**直接做成普通 `.html` 放在 `posts/` 裡。

原因很簡單：

- 只要文章內容已經直接寫進 HTML
- 那它其實就是公開的
- 即使你在畫面上把它藏起來，原始碼、快取、搜尋引擎還是可能看得到

所以如果要做真正的熟客限定文章，內容也必須像目前熟客模式資料一樣，先加密，再解密後顯示。

## 2. 如何新增一篇公開文章

### Step 1：新增文章檔案

在 `posts/` 裡新增一個新的 HTML 檔案，例如：

```powershell
posts/my-new-post.html
```

最簡單的做法是：

1. 複製一篇現有文章
2. 改掉標題、描述、內文、OG metadata、JSON-LD

最適合拿來複製的檔案：

- `posts/reason-passion.html`

### Step 2：更新首頁文章卡片

打開：

- `index.html`

找到 `Blog / Notes` 區塊，把新的卡片加進去：

- 文章標題
- 摘要
- tags
- 連結 `href`

目前首頁文章卡片就在這裡：

- `#writing` 區塊

### Step 3：更新 RSS

打開：

- `feed.xml`

新增一個 `<item>`，至少更新：

- `<title>`
- `<link>`
- `<description>`

### Step 4：更新 Sitemap

打開：

- `sitemap.xml`

新增一個 `<url>`，至少更新：

- `<loc>`
- `<changefreq>`
- `<priority>`

### Step 5：本地檢查

至少確認這幾件事：

1. 首頁卡片有顯示
2. 點進文章頁排版正常
3. 手機版沒有被導覽列遮住
4. 語言切換沒有壞掉
5. OG title / description 正確

### Step 6：發布上線

```powershell
git add index.html feed.xml sitemap.xml posts/my-new-post.html
git commit -m "Publish new blog post"
git push origin main
```

推上去之後，GitHub Pages 會自動更新。

## 3. 如何更新現有文章

如果只是改某一篇已發布文章：

1. 直接修改該篇 `posts/*.html`
2. 如果標題或摘要有變，再同步更新：
   - `index.html`
   - `feed.xml`
3. push 上去

範例：

```powershell
git add posts/reason-passion.html index.html feed.xml
git commit -m "Revise reason-passion article"
git push origin main
```

## 4. 熟客限定文章目前能不能做

### 可以做，但不要用公開文章那套方式直接做

如果你真的想讓某篇文章只有熟客可以看，正確的方向是：

1. 文章內容不要直接寫進公開 HTML
2. 文章內容要先加密
3. 進入文章頁後，需要輸入熟客模式密碼或通過熟客驗證
4. 驗證成功後，才在本機解密顯示文章內容

### 目前這個 repo 的現況

目前網站已經有：

- 熟客模式
- 本地解密
- 自動逾時鎖定

但**目前還沒有獨立的熟客限定文章發布流程**。

也就是說：

- 公開文章流程已經完整可用
- 熟客限定文章還沒有做成「你可以自己直接新增一篇」的工具化流程

## 5. 如果現在想做熟客限定文章，先不要這樣做

不要做以下這種方式：

1. 先把文章寫成 `posts/private-article.html`
2. 再用前端按鈕把它藏起來

這樣不安全，因為：

- 原始 HTML 還是公開
- 文章內容還是可能被看到
- 搜尋引擎還是可能抓到

## 6. 熟客限定文章的正確下一步

如果你要，我下一步可以幫你做一個正式的熟客限定文章系統，讓你之後能分成兩種發布：

### 公開文章

- 正常出現在首頁
- 正常出現在 `feed.xml`
- 正常出現在 `sitemap.xml`
- 可被搜尋

### 熟客限定文章

- 不直接把內容寫進公開 HTML
- 只在熟客模式下解密顯示
- 不進 `feed.xml`
- 不進 `sitemap.xml`
- 不讓搜尋引擎抓內容

## 7. 我建議你之後的發文習慣

### 公開文章

適合放：

- 研究心得
- 棒球文章
- 想法筆記
- 不涉及敏感資料的內容

### 熟客限定文章

適合放：

- 更私人的反思
- 帶有敏感個資的內容
- 不希望被搜尋引擎收錄的文章
- 只想給熟人看的照片或紀錄

## 8. 簡短結論

### 你現在自己就能做的

- 新增公開文章
- 修改公開文章
- 更新首頁卡片
- 更新 RSS / sitemap

### 你現在還不該直接自己做的

- 用普通 HTML 製作熟客限定文章

### 如果要做熟客限定文章

請用加密文章流，不要用顯示 / 隱藏假保護。
