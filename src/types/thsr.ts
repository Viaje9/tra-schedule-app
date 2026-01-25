// 高鐵車站資料
export interface ThsrStation {
  StationID: string;
  StationName: {
    Zh_tw: string;
    En: string;
  };
  StationAddress?: string;
  StationPosition?: {
    PositionLat: number;
    PositionLon: number;
  };
}

// 高鐵班次時刻表
export interface ThsrTimetable {
  TrainDate: string;
  DailyTrainInfo: {
    TrainNo: string;
    Direction: number; // 0: 南下, 1: 北上
    StartingStationID: string;
    StartingStationName: {
      Zh_tw: string;
      En: string;
    };
    EndingStationID: string;
    EndingStationName: {
      Zh_tw: string;
      En: string;
    };
  };
  OriginStopTime: {
    StationID: string;
    StationName: {
      Zh_tw: string;
      En: string;
    };
    ArrivalTime: string;
    DepartureTime: string;
  };
  DestinationStopTime: {
    StationID: string;
    StationName: {
      Zh_tw: string;
      En: string;
    };
    ArrivalTime: string;
    DepartureTime: string;
  };
}

// 高鐵查詢參數
export interface ThsrQueryParams {
  originStation: string;
  destinationStation: string;
  trainDate: string;
}

// 高鐵車站 ID 對照（方便查詢）
export const THSR_STATIONS: Record<string, string> = {
  '0990': '南港',
  '1000': '台北',
  '1010': '板橋',
  '1020': '桃園',
  '1030': '新竹',
  '1035': '苗栗',
  '1040': '台中',
  '1043': '彰化',
  '1047': '雲林',
  '1050': '嘉義',
  '1060': '台南',
  '1070': '左營',
};

// 高鐵車站順序（北到南）
export const THSR_STATION_ORDER = [
  '0990', // 南港
  '1000', // 台北
  '1010', // 板橋
  '1020', // 桃園
  '1030', // 新竹
  '1035', // 苗栗
  '1040', // 台中
  '1043', // 彰化
  '1047', // 雲林
  '1050', // 嘉義
  '1060', // 台南
  '1070', // 左營
];
