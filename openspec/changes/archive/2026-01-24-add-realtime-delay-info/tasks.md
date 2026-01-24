# Tasks: 新增列車即時延誤資訊

## 1. 型別定義
- [x] 1.1 在 `src/types/train.ts` 新增 `StationLiveBoardItem` 型別
- [x] 1.2 擴充 `DailyTrainTimetable` 新增可選的 `DelayTime` 欄位

## 2. API 整合
- [x] 2.1 在 `src/api/tdx.ts` 新增 `fetchStationLiveBoard` 函式
- [x] 2.2 新增延誤資料快取機制（2 分鐘過期）

## 3. Hook 實作
- [x] 3.1 在 `src/hooks/useTrainQuery.ts` 新增即時資料整合
- [x] 3.2 修改 `useODQuery` 整合即時延誤資料（使用 Promise.all 平行請求）

## 4. UI 顯示
- [x] 4.1 在 `TrainList.tsx` 新增 `DelayBadge` 延誤狀態標籤元件
- [x] 4.2 根據延誤狀態顯示不同顏色（準點：綠色、延誤：橘/紅色）

## 5. 驗證
- [x] 5.1 TypeScript 編譯通過
- [x] 5.2 開發伺服器正常啟動
