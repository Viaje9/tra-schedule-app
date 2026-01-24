# Tasks: Add TrainLiveBoard API Integration

## Implementation Tasks

1. **新增 TrainLiveBoardItem type 定義**
   - 檔案：`src/types/train.ts`
   - 新增 TrainLiveBoard API 回傳的資料型別
   - 驗證：TypeScript 編譯通過

2. **實作 fetchTrainLiveBoard() 函式**
   - 檔案：`src/api/tdx.ts`
   - 呼叫 `/TrainLiveBoard` API 取得全線列車即時資料
   - 實作快取機制（2 分鐘過期，與 StationLiveBoard 分開）
   - 驗證：手動測試 API 回傳資料

3. **修改 mergeDelayInfo() 支援雙資料源**
   - 檔案：`src/api/tdx.ts`
   - 優先使用 StationLiveBoard 資料
   - 若無則使用 TrainLiveBoard 資料
   - 驗證：單元測試合併邏輯

4. **更新 useODQuery hook**
   - 檔案：`src/hooks/useTrainQuery.ts`
   - 同時呼叫 StationLiveBoard 和 TrainLiveBoard
   - 傳遞雙資料源給 mergeDelayInfo()
   - 驗證：查詢後看到更多延誤資訊

5. **更新技術文件**
   - 檔案：`docs/TDX-API-README.md`
   - 標記 TrainLiveBoard 為已使用
   - 驗證：文件正確反映實作狀態

## Validation

- [x] TypeScript 編譯無錯誤
- [ ] 開發環境實測查詢功能
- [ ] 確認更多班次顯示延誤資訊
- [ ] API 失敗時仍能顯示時刻表（graceful degradation）
