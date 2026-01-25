import type { ThsrStation, ThsrTimetable } from '../types/thsr';
import { hasCredentials } from './tdx';

const BASE_URL = 'https://tdx.transportdata.tw/api/basic/v2/Rail/THSR';
const AUTH_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';

// 重用 TDX 認證機制
let accessToken: string | null = null;
let tokenExpiry: number = 0;

// 取得認證資訊（從 localStorage）
function getCredentials(): { clientId: string; clientSecret: string } | null {
  const saved = localStorage.getItem('tdx_credentials');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
}

// 取得 Access Token
async function getAccessToken(): Promise<string | null> {
  const credentials = getCredentials();
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

// 取得所有高鐵車站資料
export async function fetchThsrStations(): Promise<ThsrStation[]> {
  const response = await fetch(`${BASE_URL}/Station?$format=JSON`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`取得高鐵車站資料失敗: ${response.status}`);
  }

  const data = await response.json();

  // API 返回格式可能是陣列或 { Stations: [...] }
  if (Array.isArray(data)) {
    return data;
  } else if (data.Stations && Array.isArray(data.Stations)) {
    return data.Stations;
  }

  throw new Error('無法解析高鐵車站資料');
}

// 站對站時刻表查詢
export async function fetchThsrODTimetable(
  originStationId: string,
  destinationStationId: string,
  trainDate: string
): Promise<ThsrTimetable[]> {
  if (!hasCredentials()) {
    throw new Error('請先設定 API 認證資訊');
  }

  const url = `${BASE_URL}/DailyTimetable/OD/${originStationId}/to/${destinationStationId}/${trainDate}?$format=JSON`;

  const response = await fetch(url, {
    headers: await getHeaders(),
  });

  // 處理錯誤回應
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('查無班次資料');
    }
    if (response.status === 401) {
      throw new Error('API 認證失敗，請檢查 Client ID 和 Secret');
    }
    throw new Error(`查詢班次失敗 (${response.status})`);
  }

  const data = await response.json();

  // API 返回格式可能是陣列或 { DailyTimetables: [...] }
  let rawTimetables: any[];

  if (Array.isArray(data)) {
    rawTimetables = data;
  } else if (data.DailyTimetables && Array.isArray(data.DailyTimetables)) {
    rawTimetables = data.DailyTimetables;
  } else if (data?.message) {
    throw new Error('查無班次資料');
  } else {
    return [];
  }

  // 轉換資料格式
  const timetables: ThsrTimetable[] = rawTimetables.map((item: any) => {
    // 處理 v2 API 格式
    if (item.DailyTrainInfo && item.OriginStopTime && item.DestinationStopTime) {
      return {
        TrainDate: trainDate,
        DailyTrainInfo: item.DailyTrainInfo,
        OriginStopTime: item.OriginStopTime,
        DestinationStopTime: item.DestinationStopTime,
      };
    }

    // 處理其他格式（如有 StopTimes 陣列）
    if (item.TrainInfo && item.StopTimes) {
      const stopTimes = item.StopTimes;
      const originStop = stopTimes[0];
      const destStop = stopTimes[stopTimes.length - 1];

      return {
        TrainDate: trainDate,
        DailyTrainInfo: {
          TrainNo: item.TrainInfo.TrainNo,
          Direction: item.TrainInfo.Direction,
          StartingStationID: item.TrainInfo.StartingStationID,
          StartingStationName: item.TrainInfo.StartingStationName,
          EndingStationID: item.TrainInfo.EndingStationID,
          EndingStationName: item.TrainInfo.EndingStationName,
        },
        OriginStopTime: {
          StationID: originStop.StationID,
          StationName: originStop.StationName,
          ArrivalTime: originStop.ArrivalTime,
          DepartureTime: originStop.DepartureTime,
        },
        DestinationStopTime: {
          StationID: destStop.StationID,
          StationName: destStop.StationName,
          ArrivalTime: destStop.ArrivalTime,
          DepartureTime: destStop.DepartureTime,
        },
      };
    }

    return item;
  });

  // 按出發時間排序
  return timetables.sort((a, b) => {
    const timeA = a.OriginStopTime.DepartureTime;
    const timeB = b.OriginStopTime.DepartureTime;
    return timeA.localeCompare(timeB);
  });
}

// 計算行駛時間
export function calculateThsrDuration(departureTime: string, arrivalTime: string): string {
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
