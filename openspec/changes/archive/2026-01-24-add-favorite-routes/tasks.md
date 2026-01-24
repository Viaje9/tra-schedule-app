## 1. 資料層實作

- [x] 1.1 建立 `src/hooks/useFavoriteRoutes.ts` hook
  - 定義 FavoriteRoute 型別 (id, originId, destinationId, originName, destName)
  - 實作 localStorage 讀取/寫入邏輯
  - 實作 addRoute、removeRoute、getRoutes 方法
  - 實作最多 5 組限制檢查

## 2. UI 元件實作

- [x] 2.1 建立 `src/components/FavoriteRoutes.tsx` 元件
  - 採用與 TimeRangePicker 一致的視覺風格
  - 顯示已儲存的路線為 pill-shaped 按鈕
  - 點擊路線按鈕時帶入對應的起訖站
  - 無儲存路線時顯示提示文字
  - 新增「儲存當前路線」按鈕（+ 圖示）
  - 實作刪除模式：長按或點擊編輯按鈕進入刪除模式

## 3. 整合至 App

- [x] 3.1 在 App.tsx 整合 FavoriteRoutes 元件
  - 放置於起訖站選擇區下方
  - 傳入當前起訖站與車站列表
  - 處理路線選擇事件（更新起訖站）

## 4. 測試驗證

- [x] 4.1 手動測試常用路線儲存功能
  - 驗證儲存路線至 localStorage
  - 驗證點擊路線可正確帶入起訖站
  - 驗證刪除路線功能
  - 驗證 5 組上限限制
  - 驗證頁面重新載入後路線仍存在
