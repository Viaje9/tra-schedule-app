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
