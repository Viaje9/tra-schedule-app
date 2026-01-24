# Proposal: Add TrainLiveBoard API Integration

## Problem Statement

目前系統只使用 `StationLiveBoard` API 查詢延誤資訊，但這個 API 有個限制：**只會回傳即將進出該車站的列車**。這導致：

1. 列車還沒到達起站附近時，看不到延誤資訊
2. 很多班次顯示「準點」，但實際上只是還沒有資料
3. 使用者會誤以為列車都準點，但其實是資料不完整

## Proposed Solution

新增 `TrainLiveBoard` API 整合，結合兩個 API 的資料來源：

| API | 資料範圍 | 適用情境 |
|-----|---------|---------|
| StationLiveBoard | 該站前後 30 分鐘的列車 | 列車即將到站 |
| TrainLiveBoard | 全線所有運行中的列車 | 列車尚未到達起站 |

### 資料合併策略

1. 同時呼叫 `StationLiveBoard` 和 `TrainLiveBoard`
2. 優先使用 `StationLiveBoard` 的延誤資訊（較精準，與該站相關）
3. 若 `StationLiveBoard` 沒有該車次資料，則使用 `TrainLiveBoard` 的資料

## Scope

- 新增 `fetchTrainLiveBoard()` API 函式
- 修改 `mergeDelayInfo()` 邏輯，支援雙資料源合併
- 新增 TrainLiveBoard 快取機制（與 StationLiveBoard 分開）
- 更新 type 定義

## Out of Scope

- 列車追蹤地圖功能（TrainLiveBoard 有提供列車位置，但本次不實作地圖）
- 自動重新整理延誤資訊

## Risks & Considerations

1. **API 請求數增加**：每次查詢會多一個 TrainLiveBoard 請求，但可透過快取減緩
2. **資料量較大**：TrainLiveBoard 回傳全線列車，比 StationLiveBoard 資料量大
3. **延誤時間可能不一致**：兩個 API 的更新頻率可能不同，需以 StationLiveBoard 為主

## Success Criteria

- 使用者查詢班次時，能看到更多列車的延誤資訊
- 不影響現有功能的穩定性
- API 請求失敗時仍能 graceful degradation
