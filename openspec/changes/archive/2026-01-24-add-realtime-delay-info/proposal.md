# Change: 新增列車即時延誤資訊

## Why
目前專案使用的時刻表 API 只提供預定時間，無法顯示列車是否延誤。用戶需要知道列車的即時狀態，以便做出更好的出行決策。

## What Changes
- 新增 TDX StationLiveBoard API 整合，取得車站即時到離站資料
- 在班次列表中顯示延誤狀態標籤（準點/延誤 N 分鐘）
- 新增即時資料快取機制，避免重複請求
- 新增延誤資料的 TypeScript 型別定義

## Impact
- Affected specs: realtime-delay（新增）
- Affected code:
  - `src/api/tdx.ts` - 新增 fetchStationLiveBoard 函式
  - `src/types/train.ts` - 新增 StationLiveBoard 型別
  - `src/hooks/useTrainQuery.ts` - 新增 useLiveBoard hook
  - `src/components/TrainList.tsx` - 顯示延誤標籤
