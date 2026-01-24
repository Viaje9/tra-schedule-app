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
}

// 車次詳細時刻表
export interface TrainTimetable {
  TrainDate: string;
  DailyTrainInfo: {
    TrainNo: string;
    Direction: number;
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
    TrainTypeID: string;
    TrainTypeCode: string;
    TrainTypeName: {
      Zh_tw: string;
      En: string;
    };
  };
  StopTimes: StopTime[];
}

// 查詢參數
export interface QueryParams {
  originStation: string;
  destinationStation: string;
  trainDate: string;
}
