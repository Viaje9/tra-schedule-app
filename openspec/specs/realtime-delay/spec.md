# realtime-delay Specification

## Purpose
TBD - created by archiving change add-realtime-delay-info. Update Purpose after archive.
## Requirements
### Requirement: Realtime Delay Display
系統 SHALL 在班次列表中顯示每班列車的即時延誤狀態。

#### Scenario: 列車準點
- **WHEN** 列車的 DelayTime 為 0 或無延誤資料
- **THEN** 顯示綠色「準點」標籤

#### Scenario: 列車延誤
- **WHEN** 列車的 DelayTime 大於 0
- **THEN** 顯示橘色或紅色「延誤 N 分」標籤，其中 N 為延誤分鐘數

#### Scenario: 延誤資料無法取得
- **WHEN** StationLiveBoard API 請求失敗
- **THEN** 不顯示延誤標籤，正常顯示時刻表資料（graceful degradation）

### Requirement: StationLiveBoard API Integration
系統 SHALL 使用 TDX StationLiveBoard API 取得指定車站的即時到離站資料。

#### Scenario: 查詢起站即時資料
- **WHEN** 使用者完成站對站查詢
- **THEN** 系統以起站 ID 呼叫 `/StationLiveBoard/Station/{StationID}`

#### Scenario: 比對班次延誤
- **WHEN** 取得 StationLiveBoard 資料
- **THEN** 系統以車次號碼（TrainNo）比對查詢結果，將 DelayTime 加入對應班次

### Requirement: Delay Data Caching
系統 SHALL 快取即時延誤資料以減少 API 請求次數。

#### Scenario: 快取有效期間
- **WHEN** 同一車站的 StationLiveBoard 資料在 2 分鐘內已取得
- **THEN** 直接使用快取資料，不重新請求 API

#### Scenario: 快取過期
- **WHEN** 快取資料超過 2 分鐘
- **THEN** 重新請求 StationLiveBoard API 並更新快取

### Requirement: TrainLiveBoard Data Caching
系統 SHALL 快取 TrainLiveBoard 資料以減少 API 請求次數。

#### Scenario: TrainLiveBoard 快取有效期間
- **WHEN** TrainLiveBoard 資料在 2 分鐘內已取得
- **THEN** 直接使用快取資料，不重新請求 API

#### Scenario: TrainLiveBoard 快取過期
- **WHEN** 快取資料超過 2 分鐘
- **THEN** 重新請求 TrainLiveBoard API 並更新快取

