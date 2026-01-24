# Design: redesign-station-picker

## Overview

將 `StationPicker` 從兩段式頁面切換重構為左右雙欄並排介面。

## Layout Structure

```
┌─────────────────────────────────────────────┐
│  ←  選擇車站            🔍      確定        │  Header
├─────────────────────────────────────────────┤
│  ┌──────────┐          ┌──────────┐        │
│  │   出發   │    ⇆     │   抵達   │        │  Station Buttons
│  │  臺中    │          │   彰化   │        │
│  └──────────┘          └──────────┘        │
├─────────────────────────────────────────────┤
│  [        搜尋車站...                  ]    │  Search Bar
├─────────────────┬───────────────────────────┤
│                 │                           │
│  基隆           │  北新竹                   │
│  ─────────      │  ─────────────            │
│  臺北           │  新竹                ✓    │
│  ─────────      │  ─────────────            │
│  新北           │  三姓橋                   │
│  ─────────      │  ─────────────            │
│  桃園           │  香山                     │
│  ─────────      │  ─────────────            │
│  新竹      ✓    │  ...                      │
│  ─────────      │                           │
│  苗栗           │                           │
│  ─────────      │                           │
│  臺中           │                           │
│  ...            │                           │
│                 │                           │
│  (獨立捲軸)      │  (獨立捲軸)              │
└─────────────────┴───────────────────────────┘
     左欄 ~40%           右欄 ~60%
```

## Component Structure

```tsx
<div className="fixed inset-0 ...">
  {/* Header */}
  <div>...</div>

  {/* 起訖站按鈕區 */}
  <div>...</div>

  {/* 搜尋框 */}
  <div>...</div>

  {/* 雙欄主體 */}
  <div className="flex flex-1 overflow-hidden">
    {/* 左欄：城市列表 */}
    <div className="w-2/5 overflow-y-auto border-r">
      {sortedCities.map(city => (
        <CityItem
          selected={city === selectedCity}
          highlighted={cityHasSelectedStation(city)}
        />
      ))}
    </div>

    {/* 右欄：車站列表 */}
    <div className="w-3/5 overflow-y-auto">
      {currentCityStations.map(station => (
        <StationItem
          selected={isSelected(station.StationID)}
        />
      ))}
    </div>
  </div>
</div>
```

## Interaction Flow

1. **初始狀態**
   - 左欄顯示所有城市
   - 預設選中第一個城市（基隆市）或包含已選車站的城市
   - 右欄顯示該城市的車站
   - activeField 預設為 'origin'

2. **選擇城市**
   - 點擊左欄城市 → 更新 selectedCity → 右欄顯示該城市車站
   - 城市項目顯示高亮（藍色文字 + 打勾）

3. **選擇車站**
   - 點擊右欄車站 → 更新 tempOrigin 或 tempDestination
   - 車站項目顯示高亮（藍色文字 + 打勾）
   - 自動切換 activeField（origin → destination）

4. **搜尋模式**
   - 輸入搜尋文字時，雙欄區域改為顯示搜尋結果列表
   - 搜尋結果跨所有城市
   - 清空搜尋時回到雙欄模式

5. **確定**
   - 點擊確定按鈕 → 呼叫 onSelect(tempOrigin, tempDestination) → onClose()

## State Management

現有 state 維持不變，調整邏輯：

```tsx
const [tempOrigin, setTempOrigin] = useState(originStation);
const [tempDestination, setTempDestination] = useState(destinationStation);
const [activeField, setActiveField] = useState<'origin' | 'destination'>('origin');
const [searchText, setSearchText] = useState('');
const [selectedCity, setSelectedCity] = useState<string | null>(() => {
  // 初始化時，找出包含已選車站的城市
  // 若無已選車站，預設第一個城市
});
```

## Visual Design

- 左欄寬度：40%（`w-2/5`）
- 右欄寬度：60%（`w-3/5`）
- 分隔線：`border-r border-gray-200`
- 選中項目：藍色文字 `text-[#3b6bdf]` + 打勾圖示
- 城市項目高度：與車站項目一致，便於視覺對齊
- 兩欄各自 `overflow-y-auto` 實現獨立捲動
