# Spec: Station Picker

## ADDED Requirements

### Requirement: Layout Structure

車站選擇器 SHALL 採用左右雙欄並排佈局，左欄顯示城市列表，右欄顯示所選城市的車站列表。

#### Scenario: 開啟車站選擇器

**Given** 使用者開啟車站選擇器
**When** 元件載入完成
**Then** 左欄顯示城市列表（約 40% 寬度）
**And** 右欄顯示所選城市的車站列表（約 60% 寬度）
**And** 兩欄之間有分隔線
**And** 兩欄各自可獨立捲動

---

### Requirement: City Selection

使用者 SHALL 可點擊左欄城市以切換右欄的車站列表，選中城市顯示高亮狀態。

#### Scenario: 選擇城市

**Given** 車站選擇器已開啟
**When** 使用者點擊左欄的「臺中」城市
**Then** 「臺中」城市顯示為選中狀態（藍色文字）
**And** 右欄顯示臺中市的所有車站

#### Scenario: 城市包含已選車站

**Given** 使用者已選擇「臺中」車站作為起站
**When** 左欄城市列表渲染
**Then** 「臺中市」城市項目顯示打勾圖示

---

### Requirement: Station Selection

使用者 SHALL 可點擊右欄車站以選取作為起站或訖站，選中車站顯示打勾標記。

#### Scenario: 選擇起站

**Given** activeField 為 'origin'
**When** 使用者點擊右欄的「臺中」車站
**Then** 「臺中」車站顯示為選中狀態（藍色文字 + 打勾）
**And** 出發按鈕顯示「臺中」
**And** activeField 切換為 'destination'

#### Scenario: 選擇訖站

**Given** activeField 為 'destination'
**When** 使用者點擊右欄的「彰化」車站
**Then** 「彰化」車站顯示為選中狀態（藍色文字 + 打勾）
**And** 抵達按鈕顯示「彰化」

---

### Requirement: Initial State

開啟車站選擇器時 SHALL 預設選中包含已選車站的城市，若無已選車站則選中第一個城市。

#### Scenario: 有已選起站時的初始狀態

**Given** 使用者已選擇「臺中」車站作為起站
**When** 開啟車站選擇器
**Then** 左欄預設選中「臺中市」
**And** 右欄顯示臺中市的車站列表

#### Scenario: 無已選車站時的初始狀態

**Given** 使用者尚未選擇任何車站
**When** 開啟車站選擇器
**Then** 左欄預設選中第一個城市（基隆市）
**And** 右欄顯示基隆市的車站列表

---

### Requirement: Search Mode

搜尋時 SHALL 顯示跨城市的搜尋結果列表，清空搜尋時恢復雙欄佈局。

#### Scenario: 輸入搜尋文字

**Given** 車站選擇器已開啟
**When** 使用者在搜尋框輸入「臺」
**Then** 雙欄區域改為顯示搜尋結果列表
**And** 搜尋結果包含所有名稱含「臺」的車站

#### Scenario: 清空搜尋

**Given** 搜尋框有文字且顯示搜尋結果
**When** 使用者清空搜尋框
**Then** 恢復顯示左右雙欄佈局
