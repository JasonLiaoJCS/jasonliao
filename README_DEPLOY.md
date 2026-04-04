# Jason Liao Personal Website

這是一個已完成視覺設計與 SEO 基礎配置的靜態個人網站，可直接部署到 GitHub Pages、Netlify 或 Cloudflare Pages。

## 內容特色
- 高級感暗色＋金屬質感視覺
- 個人首頁＋部落格文章頁
- SEO 基本設定：
  - `meta description`
  - Open Graph / Twitter meta
  - `robots.txt`
  - `sitemap.xml`
  - JSON-LD structured data
- 響應式設計（手機 / 平板 / 桌機）
- 已內建 Jason Liao logo 與社群預覽圖

## 檔案結構
- `index.html`：首頁
- `style.css`：樣式
- `app.js`：互動
- `posts/`：文章頁
- `assets/`：logo / favicon / og cover
- `robots.txt`
- `sitemap.xml`
- `feed.xml`
- `404.html`

## 部署方式（最簡單）
### 方法 A：GitHub Pages
1. 建立 GitHub repository，例如 `jasonliao-site`
2. 上傳整包檔案
3. 到 repository `Settings` → `Pages`
4. Source 選擇 `Deploy from a branch`
5. Branch 選 `main` / root
6. 儲存後，網站會發布在 `https://你的帳號.github.io/jasonliao-site/`

### 方法 B：Cloudflare Pages / Netlify
1. 建立新專案
2. 直接拖曳整個資料夾或連接 GitHub repository
3. Build command 留空（這是純靜態網站）
4. Publish directory 設為根目錄 `/`

## 要真的「能被搜尋到」，你還要做這 4 件事
1. **公開部署網站**：本機檔案不會被搜尋引擎索引。
2. **把 `YOUR-DOMAIN.com` 換成你的真實網址**：
   - `robots.txt`
   - `sitemap.xml`
   - `feed.xml`
3. **到 Google Search Console 提交 sitemap**：
   - 例如 `https://你的網域/sitemap.xml`
4. **持續新增內容**：部落格持續更新，會比只有單頁履歷更容易被搜尋與辨識。

## 建議網域
- `jasonliao.dev`
- `jasonliao.me`
- `jasonliao.tw`

## 你可以再自行替換的內容
- 聯絡信箱
- GitHub / LinkedIn 連結
- 真實專案頁面
- 更多部落格文章
- 自己的大頭照（目前以 logo 視覺作主）

## 小提醒
目前網站中的 SEO 檔案使用 `https://YOUR-DOMAIN.com/` 當佔位。部署前請全文搜尋 `YOUR-DOMAIN.com` 並替換成你的真實網址。
