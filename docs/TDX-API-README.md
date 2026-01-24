# TDX 台鐵 API 技術文件

本文件整理 TDX（運輸資料流通服務平台）提供的台鐵相關 API，供開發參考使用。

## 基本資訊

| 項目 | 內容 |
|------|------|
| 平台名稱 | TDX 運輸資料流通服務平台 |
| 官方網站 | https://tdx.transportdata.tw/ |
| API 文件 | https://tdx.transportdata.tw/api-service/swagger |
| 軌道 API 文件 | https://tdx.transportdata.tw/api-service/swagger/basic/268fc230-2e04-471b-a728-a726167c1cfc |
| 會員註冊 | https://tdx.transportdata.tw/register |

## API 基礎 URL

```
V2: https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/
V3: https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/
```

---

## API 端點列表

### 一、基礎資料類

| 端點 | HTTP | 功能說明 |
|------|------|---------|
| `/Network` | GET | 取得臺鐵路網資料 |
| `/Station` | GET | 取得所有車站基本資料（ID、名稱、等級、地址、經緯度） |
| `/StationExit` | GET | 取得車站出入口資料 |
| `/StationFacility` | GET | 取得車站設施資料 |
| `/Line` | GET | 取得路線基本資料 |
| `/StationOfLine` | GET | 取得特定路線上的車站資料 |
| `/TrainType` | GET | 取得所有列車車種資料（自強、莒光、區間車等） |

### 二、時刻表類

| 端點 | HTTP | 功能說明 |
|------|------|---------|
| `/GeneralTrainTimetable` | GET | 定期時刻表（適用於查詢 60 天以後的班次） |
| `/GeneralStationTimetable` | GET | 各站的定期站別時刻表 |
| `/SpecificTrainTimetable` | GET | 特殊車次時刻表（加班車等） |
| `/DailyTrainTimetable/Today` | GET | 當天所有車次時刻表 |
| `/DailyTrainTimetable/OD/{起站ID}/to/{訖站ID}/{日期}` | GET | 站對站班次查詢 |
| `/DailyTrainTimetable/TrainNo/{車次}/{日期}` | GET | 特定車次詳細時刻表 |
| `/DailyStationTimetable/Today` | GET | 當天各站站別時刻表 |

### 三、即時動態類

| 端點 | HTTP | 功能說明 |
|------|------|---------|
| `/StationLiveBoard` | GET | 列車即時到離站資料（電子看板） |
| `/StationLiveBoard/Station/{車站ID}` | GET | 特定車站的即時到離站資料 |
| `/TrainLiveBoard` | GET | 列車即時位置動態資料 |
| `/LiveBoard/Station/{車站ID}` | GET | 特定車站的即時班車資訊 |

### 四、轉乘與票價類

| 端點 | HTTP | 功能說明 |
|------|------|---------|
| `/LineTransfer` | GET | 內部路線轉乘資料 |
| `/StationTransfer` | GET | 車站轉乘資料 |
| `/ODFare` | GET | 站間票價資訊 |

### 五、其他

| 端點 | HTTP | 功能說明 |
|------|------|---------|
| `/GeneralTrainInfo/TrainNo/{車次}` | GET | 指定車次的起訖站基本資訊 |
| `/Shape` | GET | 軌道路線的地理線型資料 |
| `/TravelTime` | GET | 站間各車種中位數旅行時間 |

---

## 認證方式

TDX API 採用 **OAuth 2.0 Client Credentials Grant** 認證機制。

### 認證流程

1. 到 [TDX 平台](https://tdx.transportdata.tw/register) 註冊成為會員
2. 在會員中心取得 **Client ID** 和 **Client Secret**（最多可建立 3 組）
3. 發送 POST 請求取得 Access Token
4. 將 Token 帶入 API 請求的 Header

### 取得 Token

```http
POST https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={YOUR_CLIENT_ID}&client_secret={YOUR_CLIENT_SECRET}
```

**回應範例：**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### API 請求

```http
GET https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/Station?$format=JSON
Authorization: Bearer {ACCESS_TOKEN}
```

---

## 常用查詢參數

TDX API 支援 OData 查詢語法：

| 參數 | 說明 | 範例 |
|------|------|------|
| `$format` | 回傳格式 | `$format=JSON` |
| `$top` | 限制回傳筆數 | `$top=10` |
| `$skip` | 跳過前 N 筆 | `$skip=20` |
| `$filter` | 篩選條件 | `$filter=StationID eq '1000'` |
| `$select` | 選擇欄位 | `$select=StationID,StationName` |
| `$orderby` | 排序 | `$orderby=StationID asc` |

---

## 使用注意事項

### 資料時效性

- **每日時刻表**：台鐵提供近 **60 天** 的每日時刻表
- 超過 60 天請使用 `/GeneralTrainTimetable`（定期時刻表）

### 即時資料

- `StationLiveBoard` 資料延遲約 **2 分鐘**
- 資料來源與台鐵官網列車動態一致

### 請求限制

| 類型 | 限制 |
|------|------|
| 未註冊使用者 | 同一 IP 每日 50 次 |
| 已註冊使用者 | 依會員等級而定 |

### 車站代碼說明

| 代碼類型 | 用途 | 說明 |
|---------|------|------|
| `StationID` | 排點系統 | 時刻表資料以此為主 |
| `StationCode` | 票務系統 | 訂票系統使用 |

---

## 本專案使用情況

目前專案 (`src/api/tdx.ts`) 使用的 API：

| 狀態 | API | 功能 |
|------|-----|------|
| ✅ 已使用 | `/Station` | 取得車站資料 |
| ✅ 已使用 | `/DailyTrainTimetable/OD/...` | 站對站班次查詢 |
| ✅ 已使用 | `/DailyTrainTimetable/TrainNo/...` | 車次詳細時刻表 |
| ✅ 已使用 | `/StationLiveBoard/Station/{車站ID}` | 特定車站即時到離站資料 |
| ✅ 已使用 | `/TrainLiveBoard` | 全線列車即時位置動態 |

### 可考慮擴充的 API

| API | 功能 | 應用場景 |
|-----|------|---------|
| `/ODFare` | 票價查詢 | 顯示車票價格 |
| `/TrainType` | 車種資料 | 車種圖示/顏色對應 |

---

## 參考資源

- [TDX 官方網站](https://tdx.transportdata.tw/)
- [線上 API 說明 (Swagger)](https://tdx.transportdata.tw/api-service/swagger)
- [官方範例程式碼 (GitHub)](https://github.com/tdxmotc/SampleCode)
- [TDX 使用指引 (GitBook)](https://motc-ptx.gitbook.io/tdx-zi-liao-shi-yong-kui-hua-bao-dian)
- [PTX 轉 TDX 教學 (HackMD)](https://hackmd.io/@flagmaker/rkYuM0955)

---

## 更新紀錄

| 日期 | 說明 |
|------|------|
| 2026-01-24 | 初版建立 |
