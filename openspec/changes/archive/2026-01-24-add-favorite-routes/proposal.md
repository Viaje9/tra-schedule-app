# Change: 新增常用路線儲存功能

## Why

使用者經常查詢固定的起訖站組合（如通勤路線），每次都需要重新選擇車站非常不便。提供常用路線儲存功能可以大幅提升使用體驗，讓使用者一鍵帶入常用的起訖站。

## What Changes

- 新增常用路線元件，放置於查詢表單的起訖站選擇區下方
- 元件設計風格與 TimeRangePicker 一致：pill-shaped 快捷按鈕
- 使用者可儲存最多 5 組常用路線
- 路線資料使用 localStorage 持久化儲存
- 提供手動儲存當前起訖站為常用路線的功能
- 提供刪除已儲存路線的功能

## Impact

- Affected specs: 新增 `favorite-routes` capability
- Affected code:
  - `src/App.tsx` - 整合 FavoriteRoutes 元件
  - 新增 `src/components/FavoriteRoutes.tsx` - 常用路線元件
  - 新增 `src/hooks/useFavoriteRoutes.ts` - 路線儲存邏輯 hook
