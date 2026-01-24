# 時間區間篩選功能規劃

## 功能需求
讓使用者可以指定時間區間（例如 08:00 ~ 12:00），只顯示該時間範圍內出發的班次。

## 實作方案

### 方案：前端篩選（推薦）
在前端加入時間篩選 UI 和邏輯，查詢結果後在前端過濾顯示。

**優點：**
- TDX API 不支援時間區間參數，只能在前端處理
- 用戶調整時間區間時不需要重新呼叫 API，體驗更流暢
- 實作簡單，改動範圍小

## 修改檔案

### 1. `src/App.tsx`
- 新增 `startTime` 和 `endTime` state（預設為空，表示不限制）
- 新增 `filteredTrains` 計算邏輯，根據時間區間過濾 `trains`
- 傳遞篩選後的結果給 `TrainList`

### 2. `src/components/TimeRangePicker.tsx`（新增）
建立時間區間選擇器組件：
- 兩個時間輸入框：開始時間、結束時間
- 快速選擇按鈕：「上午」「下午」「晚上」「全部」
- 清除按鈕

### 3. `src/index.css`
- 新增時間選擇器相關樣式（如需要）

## UI 設計
```
┌─────────────────────────────────────┐
│  日期選擇器                          │
├─────────────────────────────────────┤
│  時間區間                            │
│  ┌──────┐  ~  ┌──────┐              │
│  │ 08:00│     │ 12:00│   [全部]     │
│  └──────┘     └──────┘              │
│  [上午] [下午] [晚上]                │
└─────────────────────────────────────┘
```

## 實作細節

### 時間篩選邏輯
```typescript
const filteredTrains = useMemo(() => {
  if (!startTime && !endTime) return trains;

  return trains.filter(train => {
    const depTime = train.OriginStopTime.DepartureTime;
    if (startTime && depTime < startTime) return false;
    if (endTime && depTime > endTime) return false;
    return true;
  });
}, [trains, startTime, endTime]);
```

### 快速選擇時段
- 上午：06:00 ~ 12:00
- 下午：12:00 ~ 18:00
- 晚上：18:00 ~ 24:00
- 全部：清除時間限制

## 驗證方式
1. 查詢彰化 → 新烏日
2. 設定時間區間 08:00 ~ 12:00
3. 確認只顯示該時段的班次
4. 點擊「全部」確認恢復顯示所有班次
