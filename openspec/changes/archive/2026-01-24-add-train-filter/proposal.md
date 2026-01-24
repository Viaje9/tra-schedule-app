# Change: 新增列車過濾功能

## Why
使用者需要快速篩選查詢結果，依車型過濾班次，以及選擇是否顯示已發車的列車。這能提升查找班次的效率。

## What Changes
- 在查詢結果區域右側新增「過濾」按鈕
- 點擊後展開過濾選單，包含：
  - 車型勾選：可多選車型（太魯閣、普悠瑪、自強、莒光、復興、區間、普快、區間快、新自強），預設全選
  - 顯示已過站：勾選框，預設打勾
- 已過站的列車在列表中顯示「已發車」標籤

## Impact
- Affected specs: 新增 `train-filter` capability
- Affected code: `src/components/TrainList.tsx`, `src/App.tsx`
