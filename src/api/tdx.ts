import type { Station, DailyTrainTimetable, TrainTimetable } from '../types/train';

const BASE_URL = 'https://tdx.transportdata.tw/api/basic/v2/Rail/TRA';
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

// 取得所有車站資料
export async function fetchStations(): Promise<Station[]> {
  const response = await fetch(`${BASE_URL}/Station?$format=JSON`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`取得車站資料失敗: ${response.status}`);
  }

  return response.json();
}

// Demo 模式檢查
export function isDemoMode(): boolean {
  return !hasCredentials();
}

// 產生模擬班次資料
function generateDemoTimetable(
  originStationId: string,
  destinationStationId: string,
  trainDate: string,
  originName: string,
  destName: string
): DailyTrainTimetable[] {
  const trainTypes = [
    { code: '1', name: '太魯閣', duration: 210 },
    { code: '2', name: '普悠瑪', duration: 215 },
    { code: '3', name: '自強', duration: 240 },
    { code: '4', name: '莒光', duration: 300 },
    { code: '6', name: '區間', duration: 360 },
  ];

  const baseHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  return baseHours.map((hour, index) => {
    const trainType = trainTypes[index % trainTypes.length];
    const depMin = Math.floor(Math.random() * 30);
    const durationMin = trainType.duration + Math.floor(Math.random() * 30) - 15;

    const depTime = `${hour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;
    const arrHour = hour + Math.floor((depMin + durationMin) / 60);
    const arrMin = (depMin + durationMin) % 60;
    const arrTime = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;

    return {
      TrainDate: trainDate,
      DailyTrainInfo: {
        TrainNo: `${100 + index}`,
        Direction: 0,
        TrainTypeID: trainType.code,
        TrainTypeCode: trainType.code,
        TrainTypeName: {
          Zh_tw: trainType.name,
          En: trainType.name,
        },
      },
      OriginStopTime: {
        StopSequence: 1,
        StationID: originStationId,
        StationName: {
          Zh_tw: originName,
          En: originName,
        },
        ArrivalTime: depTime,
        DepartureTime: depTime,
      },
      DestinationStopTime: {
        StopSequence: 10,
        StationID: destinationStationId,
        StationName: {
          Zh_tw: destName,
          En: destName,
        },
        ArrivalTime: arrTime,
        DepartureTime: arrTime,
      },
    };
  });
}

// 站對站時刻表查詢
export async function fetchODTimetable(
  originStationId: string,
  destinationStationId: string,
  trainDate: string,
  originName?: string,
  destName?: string
): Promise<DailyTrainTimetable[]> {
  // Demo 模式：返回模擬資料
  if (isDemoMode()) {
    return generateDemoTimetable(
      originStationId,
      destinationStationId,
      trainDate,
      originName || '起站',
      destName || '訖站'
    );
  }

  const url = `${BASE_URL}/DailyTrainTimetable/OD/${originStationId}/to/${destinationStationId}/${trainDate}?$format=JSON`;

  const response = await fetch(url, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`查詢班次失敗: ${response.status}`);
  }

  return response.json();
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

  return response.json();
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
