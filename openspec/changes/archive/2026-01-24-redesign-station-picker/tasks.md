# Tasks: redesign-station-picker

## Implementation Tasks

- [x] **1. 重構 StationPicker 版面結構**
  - 移除 selectedCity 切換頁面的邏輯
  - 建立左右雙欄的 flex 容器
  - 左欄 40% 寬度，右欄 60% 寬度
  - 兩欄各自設定 `overflow-y-auto`

- [x] **2. 實作左欄城市列表**
  - 渲染所有城市（使用現有 sortedCities）
  - 點擊城市時更新 selectedCity（不切換頁面）
  - 選中城市顯示藍色文字 + 打勾圖示
  - 城市包含已選車站時也顯示打勾

- [x] **3. 實作右欄車站列表**
  - 根據 selectedCity 顯示該城市的車站
  - 點擊車站時更新 tempOrigin/tempDestination
  - 選中車站顯示藍色文字 + 打勾圖示
  - 選站後自動切換 activeField

- [x] **4. 調整初始化邏輯**
  - 預設 selectedCity 為包含已選起站的城市
  - 若無已選車站，預設第一個城市

- [x] **5. 保留搜尋功能**
  - 搜尋時隱藏雙欄，顯示搜尋結果列表
  - 清空搜尋時恢復雙欄顯示

- [x] **6. 移除不需要的返回按鈕邏輯**
  - Header 不再需要「返回」按鈕
  - 只保留關閉按鈕

## Validation

- [x] 點擊城市可切換右欄車站列表
- [x] 點擊車站可選取並顯示打勾
- [x] 選擇起站後自動切換到訖站選擇
- [x] 搜尋功能正常運作
- [x] 兩欄可獨立捲動
- [x] 確定按鈕正確傳遞選擇結果
