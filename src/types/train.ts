// 車站等級
// 0: 特等站, 1: 一等站, 2: 二等站, 3: 三等站, 4: 簡易站
export type StationClass = '0' | '1' | '2' | '3' | '4';

// 車站資料
export interface Station {
  StationID: string;
  StationName: {
    Zh_tw: string;
    En: string;
  };
  StationClass: StationClass;
  StationAddress?: string;
  StationPosition?: {
    PositionLat: number;
    PositionLon: number;
  };
  LocationCity?: string; // 城市名稱
}

// 主要車站（特等、一等、二等）
export const MAJOR_STATION_CLASSES: StationClass[] = ['0', '1', '2'];

// 車站等級名稱
export const STATION_CLASS_NAMES: Record<StationClass, string> = {
  '0': '特等站',
  '1': '一等站',
  '2': '二等站',
  '3': '三等站',
  '4': '簡易站',
};

// 車種資料
export interface TrainType {
  TrainTypeID: string;
  TrainTypeCode: string;
  TrainTypeName: {
    Zh_tw: string;
    En: string;
  };
}

// 停靠站資料
export interface StopTime {
  StopSequence: number;
  StationID: string;
  StationName: {
    Zh_tw: string;
    En: string;
  };
  ArrivalTime: string;
  DepartureTime: string;
}

// 每日班次時刻表
export interface DailyTrainTimetable {
  TrainDate: string;
  DailyTrainInfo: {
    TrainNo: string;
    Direction: number;
    TrainTypeID: string;
    TrainTypeCode: string;
    TrainTypeName: {
      Zh_tw: string;
      En: string;
    };
  };
  OriginStopTime: {
    StopSequence: number;
    StationID: string;
    StationName: {
      Zh_tw: string;
      En: string;
    };
    ArrivalTime: string;
    DepartureTime: string;
  };
  DestinationStopTime: {
    StopSequence: number;
    StationID: string;
    StationName: {
      Zh_tw: string;
      En: string;
    };
    ArrivalTime: string;
    DepartureTime: string;
  };
  DelayTime?: number; // 延誤分鐘數（即時資料）
}

// 車站即時到離站資料（StationLiveBoard）
export interface StationLiveBoardItem {
  StationID: string;
  StationName: {
    Zh_tw: string;
    En: string;
  };
  TrainNo: string;
  Direction: number;
  TrainTypeID: string;
  TrainTypeCode: string;
  TrainTypeName: {
    Zh_tw: string;
    En: string;
  };
  ScheduledArrivalTime?: string;
  ScheduledDepartureTime?: string;
  DelayTime: number; // 延誤分鐘數
}

// 列車即時位置動態資料（TrainLiveBoard）
export interface TrainLiveBoardItem {
  TrainNo: string;
  TrainTypeID: string;
  TrainTypeCode: string;
  TrainTypeName: {
    Zh_tw: string;
    En: string;
  };
  StationID: string; // 最近停靠車站
  StationName: {
    Zh_tw: string;
    En: string;
  };
  DelayTime: number; // 延誤分鐘數
}

// 查詢參數
export interface QueryParams {
  originStation: string;
  destinationStation: string;
  trainDate: string;
}
