# Acquaintance Mode Password Guide

這份文件說明如何更改或新增熟客模式密碼，以及熟客模式目前的自動鎖定行為。

## 1. 熟客模式密碼是怎麼改的

你現在不是去改 `app.js` 裡某一行密碼。

熟客模式的私密資料放在：

- `private-data.js`

它本身是加密的，所以「改密碼」其實是：

1. 先用目前有效密碼解開舊的 `private-data.js`
2. 再用你想保留的新密碼重新加密
3. 產生新的 `private-data.js`
4. commit / push 後，線上網站就會套用新密碼

你要使用的工具是：

- `scripts/private-profile-passwords.mjs`

## 2. 最基本的使用方式

先進入專案資料夾：

```powershell
cd C:\Users\User\Desktop\Blog
```

執行腳本：

```powershell
node scripts\private-profile-passwords.mjs
```

腳本會依序問你：

1. `Current valid password:`
   輸入目前能解鎖熟客模式的密碼

2. `Target password #1:`
   開始輸入你之後想保留為有效的密碼

3. `Target password #2:`
   如果還想保留第二組密碼，就再輸入一組

4. 直接按空白 Enter 結束
   表示目標密碼輸入完成

## 3. 常見情境

### 情境 A：只想換成一組新密碼

也就是舊密碼失效，只留新密碼。

輸入流程：

1. `Current valid password:` 舊密碼
2. `Target password #1:` 新密碼
3. 直接空白 Enter 結束

結果：

- 之後只有新密碼能解鎖
- 舊密碼失效

### 情境 B：想新增一組密碼，但舊密碼繼續可用

輸入流程：

1. `Current valid password:` 舊密碼
2. `Target password #1:` 舊密碼
3. `Target password #2:` 新密碼
4. 直接空白 Enter 結束

結果：

- 舊密碼可用
- 新密碼也可用

### 情境 C：換成兩組新密碼，舊密碼不要了

輸入流程：

1. `Current valid password:` 舊密碼
2. `Target password #1:` 新密碼 A
3. `Target password #2:` 新密碼 B
4. 直接空白 Enter 結束

結果：

- 新密碼 A 可用
- 新密碼 B 可用
- 舊密碼失效

## 4. 改完之後要做什麼

腳本會直接改寫：

- `private-data.js`

你可以先檢查變更：

```powershell
git status --short
```

如果要讓線上網站生效，再推上去：

```powershell
git add private-data.js
git commit -m "Rotate acquaintance mode passwords"
git push origin main
```

## 5. 想用一次性指令，不想互動輸入

也可以用環境變數直接執行。

範例：把舊密碼換成兩組新密碼

```powershell
$env:PRIVATE_PROFILE_CURRENT_PASSWORD='你的舊密碼'
$env:PRIVATE_PROFILE_TARGET_PASSWORDS='新密碼A||新密碼B'
node scripts\private-profile-passwords.mjs
```

說明：

- 多組目標密碼用 `||` 分隔
- 執行完後一樣要 `git add / commit / push`

## 6. 怎麼驗證有沒有成功

建議這樣檢查：

1. 本地打開網站
2. 用新密碼測試能不能解鎖
3. 如果你本來要讓舊密碼失效，也順便測一下舊密碼是不是失效
4. push 上去後，再到線上網站測一次

## 7. 自動逾時鎖定

目前熟客模式已經加上自動鎖定：

- 閒置 10 分鐘會自動鎖回去
- 切到別的分頁一段時間後回來，也會重新檢查是否過期

時間設定在：

- `app.js`

目前的常數是：

```js
const PRIVATE_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
```

如果你想改成 5 分鐘，可以改成：

```js
const PRIVATE_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
```

改完後記得重新 push：

```powershell
git add app.js index.html
git commit -m "Adjust acquaintance mode timeout"
git push origin main
```

## 8. 密碼建議

不要用太短、太像帳號、或太容易猜的字串。

建議：

- 至少 16 字以上
- 混合大小寫英文、數字、符號
- 不要直接用生日、學號、IG 帳號、名字變形

如果要保守一點，建議改成比較長的 passphrase。
