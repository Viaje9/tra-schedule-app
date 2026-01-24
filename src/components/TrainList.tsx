import type { DailyTrainTimetable } from '../types/train';
import { calculateDuration } from '../api/tdx';

interface TrainListProps {
  trains: DailyTrainTimetable[];
  loading: boolean;
  error: string | null;
  onTrainClick: (trainNo: string, trainDate: string) => void;
}

// 車種顏色對應
function getTrainTypeColor(trainTypeCode: string): string {
  switch (trainTypeCode) {
    case '1': // 太魯閣
      return 'bg-red-100 text-red-800';
    case '2': // 普悠瑪
      return 'bg-orange-100 text-orange-800';
    case '3': // 自強
      return 'bg-blue-100 text-blue-800';
    case '4': // 莒光
      return 'bg-green-100 text-green-800';
    case '5': // 復興
      return 'bg-purple-100 text-purple-800';
    case '6': // 區間
      return 'bg-gray-100 text-gray-800';
    case '7': // 區間快
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TrainList({ trains, loading, error, onTrainClick }: TrainListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">查詢中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (trains.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">
        查詢結果（共 {trains.length} 班次）
      </h2>
      <div className="space-y-2">
        {trains.map((train) => {
          const duration = calculateDuration(
            train.OriginStopTime.DepartureTime,
            train.DestinationStopTime.ArrivalTime
          );

          return (
            <button
              key={train.DailyTrainInfo.TrainNo}
              type="button"
              className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
              onClick={() => onTrainClick(train.DailyTrainInfo.TrainNo, train.TrainDate)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${getTrainTypeColor(
                      train.DailyTrainInfo.TrainTypeCode
                    )}`}
                  >
                    {train.DailyTrainInfo.TrainTypeName.Zh_tw}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {train.DailyTrainInfo.TrainNo}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">{duration}</span>
              </div>

              <div className="mt-3 flex items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {train.OriginStopTime.DepartureTime.slice(0, 5)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {train.OriginStopTime.StationName.Zh_tw}
                  </div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="border-t-2 border-dashed border-gray-300 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400">
                      →
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {train.DestinationStopTime.ArrivalTime.slice(0, 5)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {train.DestinationStopTime.StationName.Zh_tw}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
