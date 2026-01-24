import type { Station, DailyTrainTimetable, TrainTimetable } from '../types/train';

const BASE_URL = 'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA';
const AUTH_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';

// TDX 認證資訊
interface TdxCredentials {
  clientId: string;
  clientSecret: string;
}

let credentials: TdxCredentials | null = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

// 從 localStorage 載入認證資訊
function loadCredentials() {
  const saved = localStorage.getItem('tdx_credentials');
  if (saved) {
    credentials = JSON.parse(saved);
  }
}
loadCredentials();

// 設定 TDX 認證資訊
export function setCredentials(clientId: string, clientSecret: string) {
  credentials = { clientId, clientSecret };
  localStorage.setItem('tdx_credentials', JSON.stringify(credentials));
  accessToken = null; // 重設 token
  tokenExpiry = 0;
}

// 取得認證資訊
export function getCredentials(): TdxCredentials | null {
  return credentials;
}

// 清除認證資訊
export function clearCredentials() {
  credentials = null;
  accessToken = null;
  tokenExpiry = 0;
  localStorage.removeItem('tdx_credentials');
}

// 檢查是否有設定認證
export function hasCredentials(): boolean {
  return credentials !== null;
}

// 取得 Access Token
async function getAccessToken(): Promise<string | null> {
  if (!credentials) return null;

  // 如果 token 還有效，直接使用
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`認證失敗: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Token 有效期通常是 1 天，這裡設定為回傳的 expires_in 秒數
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return accessToken;
  } catch (error) {
    console.error('取得 Access Token 失敗:', error);
    return null;
  }
}

// 取得認證 headers
const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// 從地址解析城市名稱
function parseCityFromAddress(address: string | undefined): string | undefined {
  if (!address) return undefined;

  // 地址格式: "郵遞區號(5-6碼)城市名區名地址"
  // 例如: "203001基隆市中山區中山一路 16 之 1 號"
  // 例如: "41456臺中市烏日區三和里高鐵東一路 26 號"
  const match = address.match(/^\d{5,6}(.+?[市縣])/);
  return match ? match[1] : undefined;
}

// 取得所有車站資料
export async function fetchStations(): Promise<Station[]> {
  const response = await fetch(`${BASE_URL}/Station?$format=JSON`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`取得車站資料失敗: ${response.status}`);
  }

  const data = await response.json();

  // v3 API 返回格式: { Stations: [...] }
  // v2 API 返回格式: [...]
  let stations: Station[];
  if (Array.isArray(data)) {
    stations = data;
  } else if (data.Stations && Array.isArray(data.Stations)) {
    stations = data.Stations;
  } else {
    throw new Error('無法解析車站資料');
  }

  // v3 API 沒有 LocationCity，從 StationAddress 解析
  return stations.map(station => ({
    ...station,
    LocationCity: station.LocationCity || parseCityFromAddress(station.StationAddress),
  }));
}

// 站對站時刻表查詢
export async function fetchODTimetable(
  originStationId: string,
  destinationStationId: string,
  trainDate: string
): Promise<DailyTrainTimetable[]> {
  if (!hasCredentials()) {
    throw new Error('請先設定 API 認證資訊');
  }

  const url = `${BASE_URL}/DailyTrainTimetable/OD/${originStationId}/to/${destinationStationId}/${trainDate}?$format=JSON`;

  const response = await fetch(url, {
    headers: await getHeaders(),
  });

  // 處理錯誤回應
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('查無班次資料，請確認起訖站是否有直達車');
    }
    if (response.status === 401) {
      throw new Error('API 認證失敗，請檢查 Client ID 和 Secret');
    }
    throw new Error(`查詢班次失敗 (${response.status})`);
  }

  const data = await response.json();

  // v3 API 返回格式: { TrainTimetables: [{TrainInfo, StopTimes}, ...] }
  // v2 API 返回格式: [{DailyTrainInfo, OriginStopTime, DestinationStopTime}, ...]
  let rawTimetables: any[];

  if (Array.isArray(data)) {
    rawTimetables = data;
  } else if (data.TrainTimetables && Array.isArray(data.TrainTimetables)) {
    rawTimetables = data.TrainTimetables;
  } else if (data?.message) {
    throw new Error('查無班次資料，請確認起訖站是否有直達車');
  } else {
    return [];
  }

  // 轉換 v3 格式到 v2 格式
  const timetables = rawTimetables.map((item: any) => {
    // 檢查是否為 v3 格式 (有 TrainInfo 和 StopTimes)
    if (item.TrainInfo && item.StopTimes) {
      const stopTimes = item.StopTimes;
      const originStop = stopTimes[0];
      const destStop = stopTimes[stopTimes.length - 1];

      return {
        TrainDate: trainDate,
        DailyTrainInfo: {
          TrainNo: item.TrainInfo.TrainNo,
          Direction: item.TrainInfo.Direction,
          TrainTypeID: item.TrainInfo.TrainTypeID,
          TrainTypeCode: item.TrainInfo.TrainTypeCode,
          TrainTypeName: item.TrainInfo.TrainTypeName,
        },
        OriginStopTime: {
          StopSequence: originStop.StopSequence,
          StationID: originStop.StationID,
          StationName: originStop.StationName,
          ArrivalTime: originStop.ArrivalTime,
          DepartureTime: originStop.DepartureTime,
        },
        DestinationStopTime: {
          StopSequence: destStop.StopSequence,
          StationID: destStop.StationID,
          StationName: destStop.StationName,
          ArrivalTime: destStop.ArrivalTime,
          DepartureTime: destStop.DepartureTime,
        },
      };
    }
    // 已經是 v2 格式
    return item;
  });

  // 按出發時間排序
  return timetables.sort((a, b) => {
    const timeA = a.OriginStopTime.DepartureTime;
    const timeB = b.OriginStopTime.DepartureTime;
    return timeA.localeCompare(timeB);
  });
}

// 車次詳細時刻表查詢
export async function fetchTrainTimetable(
  trainNo: string,
  trainDate: string
): Promise<TrainTimetable[]> {
  const url = `${BASE_URL}/DailyTrainTimetable/TrainNo/${trainNo}/${trainDate}?$format=JSON`;

  const response = await fetch(url, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`查詢車次詳情失敗: ${response.status}`);
  }

  const data = await response.json();

  // v3 API 返回格式: { TrainTimetables: [...] }
  // v2 API 返回格式: [...]
  if (Array.isArray(data)) {
    return data;
  }
  if (data.TrainTimetables && Array.isArray(data.TrainTimetables)) {
    return data.TrainTimetables;
  }

  return [];
}

// 計算行駛時間
export function calculateDuration(departureTime: string, arrivalTime: string): string {
  const [depHour, depMin] = departureTime.split(':').map(Number);
  const [arrHour, arrMin] = arrivalTime.split(':').map(Number);

  let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);

  // 處理跨日情況
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} 小時 ${minutes} 分`;
  }
  return `${minutes} 分`;
}

// 取得今天日期 (YYYY-MM-DD 格式)
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
