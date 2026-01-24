# realtime-delay Spec Delta

## ADDED Requirements

### Requirement: TrainLiveBoard API Integration
系統 SHALL 使用 TDX TrainLiveBoard API 作為延誤資訊的補充資料來源。

#### Scenario: 查詢全線列車即時資料
- **WHEN** 使用者完成站對站查詢
- **THEN** 系統同時呼叫 `/TrainLiveBoard` 取得全線列車即時動態

#### Scenario: 資料來源優先順序
- **WHEN** 同一車次在 StationLiveBoard 和 TrainLiveBoard 都有延誤資料
- **THEN** 優先使用 StationLiveBoard 的資料（與該站更相關）

#### Scenario: 補充缺失的延誤資訊
- **WHEN** 車次不在 StationLiveBoard 資料中
- **AND** 車次存在於 TrainLiveBoard 資料中
- **THEN** 使用 TrainLiveBoard 的延誤資訊

#### Scenario: TrainLiveBoard API 請求失敗
- **WHEN** TrainLiveBoard API 請求失敗
- **THEN** 僅使用 StationLiveBoard 資料，不影響既有功能

## ADDED Requirements

### Requirement: TrainLiveBoard Data Caching
系統 SHALL 快取 TrainLiveBoard 資料以減少 API 請求次數。

#### Scenario: TrainLiveBoard 快取有效期間
- **WHEN** TrainLiveBoard 資料在 2 分鐘內已取得
- **THEN** 直接使用快取資料，不重新請求 API

#### Scenario: TrainLiveBoard 快取過期
- **WHEN** 快取資料超過 2 分鐘
- **THEN** 重新請求 TrainLiveBoard API 並更新快取
