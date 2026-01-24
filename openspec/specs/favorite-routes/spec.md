# favorite-routes Specification

## Purpose
TBD - created by archiving change add-favorite-routes. Update Purpose after archive.
## Requirements
### Requirement: Display Favorite Routes

系統 SHALL 在查詢表單區域顯示已儲存的常用路線，採用與時間選擇器一致的 pill-shaped 按鈕風格。

#### Scenario: 顯示已儲存的路線

**Given** 使用者已儲存 2 組常用路線
**When** 頁面載入完成
**Then** 常用路線區域顯示 2 個 pill-shaped 按鈕
**And** 每個按鈕顯示「起站 → 訖站」格式

#### Scenario: 無儲存路線時

**Given** 使用者尚未儲存任何路線
**When** 頁面載入完成
**Then** 常用路線區域顯示「尚無常用路線」提示
**And** 顯示「+ 儲存當前路線」按鈕

---

### Requirement: Apply Favorite Route

使用者 SHALL 可點擊常用路線按鈕以快速帶入對應的起訖站。

#### Scenario: 點擊常用路線

**Given** 使用者已儲存「臺北 → 臺中」路線
**When** 使用者點擊該路線按鈕
**Then** 起站欄位填入「臺北」
**And** 訖站欄位填入「臺中」

---

### Requirement: Save Favorite Route

使用者 SHALL 可手動將當前選擇的起訖站儲存為常用路線，最多儲存 5 組。

#### Scenario: 儲存新路線

**Given** 使用者已選擇起站「高雄」和訖站「臺南」
**And** 已儲存的路線數量少於 5 組
**When** 使用者點擊「儲存當前路線」按鈕
**Then** 新路線「高雄 → 臺南」加入常用路線列表
**And** 路線資料持久化至 localStorage

#### Scenario: 達到儲存上限

**Given** 使用者已儲存 5 組常用路線
**When** 頁面顯示儲存按鈕狀態
**Then** 「儲存當前路線」按鈕顯示為停用狀態
**And** 按鈕提示「已達上限（5/5）」

#### Scenario: 未選擇完整起訖站

**Given** 使用者僅選擇起站但未選擇訖站
**When** 頁面顯示儲存按鈕狀態
**Then** 「儲存當前路線」按鈕顯示為停用狀態

#### Scenario: 路線已存在

**Given** 使用者已儲存「臺北 → 臺中」路線
**And** 當前選擇的起訖站為「臺北」和「臺中」
**When** 使用者嘗試儲存
**Then** 顯示「路線已存在」提示
**And** 不重複儲存相同路線

---

### Requirement: Delete Favorite Route

使用者 SHALL 可刪除已儲存的常用路線。

#### Scenario: 進入編輯模式刪除路線

**Given** 使用者已儲存 3 組常用路線
**When** 使用者點擊「編輯」按鈕
**Then** 每個路線按鈕旁顯示刪除圖示（X）
**When** 使用者點擊「臺北 → 臺中」路線的刪除圖示
**Then** 該路線從列表中移除
**And** localStorage 資料同步更新

---

### Requirement: Data Persistence

常用路線資料 SHALL 使用 localStorage 持久化儲存，頁面重新載入後仍可使用。

#### Scenario: 資料持久化

**Given** 使用者已儲存常用路線
**When** 使用者關閉並重新開啟頁面
**Then** 先前儲存的常用路線仍然顯示

#### Scenario: localStorage 資料格式

**When** 路線資料寫入 localStorage
**Then** 使用 key 為 `tra-favorite-routes`
**And** 資料格式為 JSON 陣列，包含 id、originId、destinationId、originName、destName

