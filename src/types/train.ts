// 車站資料
export interface Station {
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
