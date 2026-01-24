## ADDED Requirements

### Requirement: Train Type Filter
系統 SHALL 提供車型過濾功能，讓使用者依據車型篩選查詢結果。

#### Scenario: 顯示車型過濾選項
- **WHEN** 查詢結果顯示時
- **THEN** 使用者可看到過濾按鈕
- **AND** 點擊後展開車型勾選清單

#### Scenario: 預設全選車型
- **WHEN** 使用者首次查詢
- **THEN** 所有車型預設為勾選狀態
- **AND** 顯示所有車型的班次

#### Scenario: 取消勾選特定車型
- **WHEN** 使用者取消勾選某車型（如「區間」）
- **THEN** 該車型的班次從列表中隱藏
- **AND** 重新勾選後恢復顯示

### Requirement: Departed Train Display
系統 SHALL 提供已過站列車顯示選項，並為已發車列車加上標籤。

#### Scenario: 預設顯示已過站列車
- **WHEN** 使用者首次查詢
- **THEN**「顯示已過站」選項預設為打勾
- **AND** 已過站列車顯示於列表中

#### Scenario: 隱藏已過站列車
- **WHEN** 使用者取消勾選「顯示已過站」
- **THEN** 出發時間（含延誤）早於當前時間的列車從列表隱藏

#### Scenario: 已發車標籤顯示
- **WHEN** 列車的出發時間（含延誤）早於當前時間
- **AND** 「顯示已過站」為打勾狀態
- **THEN** 該列車顯示「已發車」標籤

### Requirement: Filter Button Position
系統 SHALL 將過濾按鈕放置於查詢結果標題右側。

#### Scenario: 過濾按鈕位置
- **WHEN** 查詢結果顯示
- **THEN** 過濾按鈕位於「查詢結果」標題與班次數量之間或右側
- **AND** 按鈕圖示清晰表達過濾功能
