# Site Maintenance Manual

這份文件是給「網站管理者」看的操作手冊。

它的目標是讓你之後不需要再重新理解整個架構，只要知道：

- 我平常到底該去哪裡改東西
- 我該怎麼發新文章
- 我該怎麼更新首頁
- 我該怎麼管理熟客模式
- 我該怎麼改密碼
- 我改錯怎麼救
- 哪些事情我根本不用管

---

## 1. 先記住最重要的分工

### A. 改內容：用 Studio

Studio 後台負責：

- 首頁文案
- updates
- CMS managed posts
- 熟客資料

### B. 改程式：用 GitHub + 本地 repo

只有在你要改下面這些東西時，才需要碰 GitHub：

- 排版
- CSS
- 動畫
- 網站功能
- 後台功能
- API 行為

### 一句話

**日常維護看 Studio，程式升級才看 GitHub。**

---

## 2. 你平常要去的地方

### 後台入口

```text
/studio/
```

你現在 Cloudflare 版本的後台網址是：

```text
https://jasonliao-pages.pages.dev/studio/
```

---

## 3. 登入後台怎麼登入

現在後台登入用的是 Cloudflare 的 secrets。

你平常只要記得：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### 建議你目前的做法

- Username：`jason`
- Password：你自己設的一組原始密碼

### 如果你改了 secret 之後發現還登不進去

先做這三件事：

1. 去 Cloudflare `Deployments` 看最新部署是不是成功
2. 開無痕視窗
3. `Ctrl + F5`

---

## 4. Studio 裡每一區是做什麼的

### 4.1 Dashboard

用途：

- 看目前有幾筆 updates
- 看有幾篇 CMS managed posts
- 看熟客資料有沒有設好

通常只是看，不是主要編輯區。

### 4.2 Public Copy

用途：

- 改首頁公開版的文案

你可以改：

- Hero 自介
- About 第一段 / 第二段
- Profile Snapshot 幾段敘述
- Focus 區塊
- Contact 說明
- Footer motto

改完按：

```text
Save Public Copy
```

### 4.3 Updates

用途：

- 管首頁近期動態

可以：

- 新增 update
- 排順序
- 設公開 / 熟客可見
- 編輯中英文
- 刪除某一則

改完按：

```text
Save Updates
```

### 4.4 Posts

用途：

- 發 blog / notes

每篇文章至少要管這些欄位：

- `Slug`
- `Visibility`
- `Status`
- `Publish Date`
- 中文標題
- 英文標題
- 中文摘要
- 英文摘要
- 中文內容
- 英文內容
- tags

內容欄現在建議直接用 Markdown 寫，Studio 右側會同步顯示預覽。

### 4.5 Acquaintance Profile

用途：

- 管熟客模式下的資料

可以改：

- Email
- Phone
- Instagram
- 熟客標題與導言
- 學經歷文字
- 兩張熟客照片

改完按：

```text
Save Acquaintance Profile
```

### 4.6 Deploy

用途：

- 做整體重置

這裡有：

```text
Reset Entire CMS
```

---

## 5. 最常見的 5 種操作

### 操作 1：改首頁自介

步驟：

1. 登入 `/studio/`
2. 進 `Public Copy`
3. 找 `Hero 自介`
4. 改中文 / 英文
5. 按 `Save Public Copy`
6. 到前台重新整理確認

### 操作 2：加一則最新動態

步驟：

1. 登入 `/studio/`
2. 進 `Updates`
3. 按 `Add Update`
4. 填日期、中文、英文
5. 選 `Public` 或 `Acquaintance`
6. 按 `Save Updates`

### 操作 3：發一篇公開文章

步驟：

1. 登入 `/studio/`
2. 進 `Posts`
3. 按 `New Post`
4. 填 `Slug`
5. `Visibility` 選 `Public`
6. `Status` 選 `Published`
7. 填標題、摘要、Markdown 內容
8. 按 `Save Post`
9. 用 `Open Current URL` 檢查

### 操作 4：發一篇只有熟客能看的文章

步驟：

1. 登入 `/studio/`
2. 進 `Posts`
3. 按 `New Post`
4. 填 `Slug`
5. `Visibility` 選 `Acquaintance`
6. `Status` 選 `Published`
7. 填 Markdown 內容
8. 按 `Save Post`

這篇文章之後會是 CMS managed 的熟客限定文章。

### 操作 5：更新熟客聯絡方式或照片

步驟：

1. 登入 `/studio/`
2. 進 `Acquaintance Profile`
3. 改 Email / Phone / Instagram
4. 上傳照片
5. 改文字
6. 按 `Save Acquaintance Profile`

---

## 6. `Save`、`Draft`、`Published`、`Public`、`Acquaintance` 到底差在哪

### `Save`

表示把你目前表單裡的內容正式寫進資料庫。

如果你沒有按 `Save`：

- 你只是暫時在頁面上改字
- 一重新整理就不見

### `Draft`

表示文章是草稿。

### `Published`

表示文章正式發布。

### `Public`

表示所有人都能看。

### `Acquaintance`

表示要通過熟客模式才能看。

---

## 7. 目前文章系統的重點限制

### 文章內容現在是 Markdown 編輯器 + 即時預覽

也就是：

- 你不用再手打原始 HTML
- 你可以直接寫 Markdown
- Studio 會提供常用格式工具列
- Studio 會即時顯示視覺預覽

例如一小段正文現在可以直接寫成：

```md
## 小標題

這是第一段。

- 第一點
- 第二點

這是 **重點**，這是 [連結](https://example.com)。
```

目前編輯體驗是：

- Markdown 原始內容欄
- 常用格式按鈕
- Live Preview 視覺預覽

另外要注意：

- 以前已經存在的 HTML 文章仍然可以正常顯示
- 新文章建議直接用 Markdown 寫
- 如果你把原本就是 HTML 的舊文章貼進去，系統也會相容，不會直接壞掉

---

## 8. 如果我改得不滿意，怎麼回復

### 情況 A：還沒按 Save

最簡單：

- 直接重新整理頁面

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

#### 整個 CMS 都想回到最初

去 `Deploy` 區，按：

```text
Reset Entire CMS
```

### 這個大重置會做什麼

- 公開文案回預設
- updates 回預設
- 熟客資料回預設
- CMS managed posts 清空

所以按之前要看清楚。

---

## 9. 你以後怎麼改密碼

現在最簡單、最建議的方式是直接改 Cloudflare secrets。

### 9.1 改後台登入密碼

去：

`Cloudflare -> jasonliao-pages -> Settings -> Variables and Secrets`

改：

- `ADMIN_PASSWORD`

改完之後：

1. 儲存
2. 去 `Deployments`
3. 重新部署一次

### 9.2 改熟客模式密碼

同樣在 Cloudflare 改：

- `ACQUAINTANCE_PASSWORD`

改完後同樣重新部署。

---

## 10. `ADMIN_PASSWORD_HASH` 還要不要用

你現在**可以不用管**。

目前後台已經支援直接密碼 secret，所以建議：

- 用 `ADMIN_PASSWORD`
- 不要再為了日常維護去碰 `ADMIN_PASSWORD_HASH`

熟客模式也是一樣：

- 用 `ACQUAINTANCE_PASSWORD`
- 不要把自己搞進 hash 地獄

---

## 11. 可不可以同時有兩組以上密碼

### 後台 Admin

目前：

- **不支援多組密碼**
- 只有 1 組 `ADMIN_USERNAME` + 1 組 `ADMIN_PASSWORD`（或 hash）

### Cloudflare 版熟客模式

目前：

- **也不支援多組**
- 只有 1 組 `ACQUAINTANCE_PASSWORD`（或 hash）

### 但舊的靜態 fallback 工具曾支援多組

[scripts/private-profile-passwords.mjs](C:/Users/User/Desktop/Blog/scripts/private-profile-passwords.mjs)

它可以對舊的 `private-data.js` 建立多組有效密碼。  
但這不是現在 Cloudflare Studio 主流程的主要做法。

### 實務建議

目前請把它理解成：

- Admin：1 組密碼
- Acquaintance：1 組密碼

如果未來你真的要多組熟客密碼，請把它視為「下一階段功能擴充」，不要現在混著用。

---

## 12. 什麼時候要用 GitHub

只有你要改「程式」時才需要 GitHub。

例如：

- 想換版型
- 想換動畫
- 想改首頁 HTML 結構
- 想改 Studio 功能
- 想改後台邏輯

這時候流程才是：

```powershell
git status
git add .
git commit -m "your message"
git push origin main
```

推上去後 Cloudflare 才會重新部署。

---

## 13. 什麼時候不用 GitHub

如果你只是：

- 改首頁文案
- 發一篇 CMS 文章
- 改一則 update
- 改熟客模式聯絡方式
- 換熟客照片

那你只要進 Studio。

這些操作**不需要**手動去 GitHub commit。

---

## 14. 你平常到底要不要管 branch

大多數情況下：

**不用。**

你現在最重要的是：

- GitHub 的 `main`
- Cloudflare production 追蹤的也是 `main`

所以平常不要被 branch 搞亂。

### 你只要記住

如果是正式改程式：

- 改完推到 `main`

就夠了。

---

## 15. 什麼東西你不要亂動

下面這些檔案或設定，平常請不要亂改：

- [wrangler.toml](C:/Users/User/Desktop/Blog/wrangler.toml)
- `database_id`
- `compatibility_date`
- Cloudflare `Bindings` 裡的 `CMS_DB`
- `functions/_lib/*`
- `cloudflare/schema.sql`
- `_headers`

### 為什麼

因為這些不是內容，是基礎架構。

只要亂動其中一個，就可能造成：

- Studio 登不進去
- D1 讀不到
- API 壞掉
- 部署失敗

---

## 16. 什麼事情你可以放心不用管

以下這些大多時候可以放心：

- `compatibility_date` 通常不用碰
- GitHub 多分支通常不用理
- D1 table 結構平常不用理
- `_headers` 平常不用碰
- API 路徑不用自己手動記一大堆

你平常只要會：

- 登入 Studio
- 改內容
- 按 Save
- 知道去哪裡 reset

就夠了。

---

## 17. 如果網站怪怪的，先怎麼查

### 情況 1：Studio 看起來還是舊畫面

先做：

1. 看 Cloudflare `Deployments`
2. 確認最新 deployment 是 `Success`
3. 開無痕視窗
4. `Ctrl + F5`

### 情況 2：我明明改了 Cloudflare secret，但登入不對

先做：

1. 確認有沒有改對專案：`jasonliao-pages`
2. 確認改的是 `ADMIN_PASSWORD`，不是別的欄
3. 重新部署
4. 再用無痕視窗測

### 情況 3：首頁內容沒變

先分清楚你現在打開的是：

- Cloudflare Pages 網址
  還是
- GitHub Pages 網址

因為 Studio 改的是 Cloudflare 那套資料流。

---

## 18. 如果我想健康維護這個網站，最好的習慣是什麼

### 好習慣

1. 日常只在 Studio 改內容
2. 每次改完都立即到前台確認
3. 密碼改完就記錄在自己的密碼管理器
4. 程式改動才走 GitHub
5. 不確定時先看 deployment，不要先亂改設定

### 壞習慣

1. 一邊改 Studio，一邊手改同一段 HTML
2. 不看 deployment 狀態就一直刷新
3. 把 secret 當成一般變數亂改
4. 亂碰 `wrangler.toml`

---

## 19. 你之後最常用的 3 個網址

### 後台

```text
https://jasonliao-pages.pages.dev/studio/
```

### Cloudflare 專案

`Cloudflare Dashboard -> Workers & Pages -> jasonliao-pages`

### GitHub repo

```text
https://github.com/JasonLiaoJCS/jasonliao
```

---

## 20. 最後的實務結論

你之後只要把這個網站分成兩種工作看：

### 內容工作

去 Studio 做。

### 工程工作

回 GitHub repo 改程式再部署。

你不需要每天理解：

- D1
- Functions
- schema
- compatibility_date
- branch 細節

你只需要知道這些東西現在已經幫你搭好了。

如果你要，我之後還可以再幫你補第三份文件：

- `STUDIO_QUICK_START.md`

把它寫成超短版，只留「發文 / 改首頁 / 改熟客資料 / reset」4 個操作。
