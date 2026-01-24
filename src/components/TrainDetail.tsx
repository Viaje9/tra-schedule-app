import type { TrainTimetable } from '../types/train';

interface TrainDetailProps {
  timetable: TrainTimetable | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function TrainDetail({ timetable, loading, error, onClose }: TrainDetailProps) {
  if (!timetable && !loading && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {loading ? '載入中...' : timetable ? `${timetable.DailyTrainInfo.TrainNo} 次列車` : '車次詳情'}
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">載入中...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {timetable && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <span className="font-medium">
                    {timetable.DailyTrainInfo.TrainTypeName.Zh_tw}
                  </span>
                  <span>•</span>
                  <span>
                    {timetable.DailyTrainInfo.StartingStationName.Zh_tw} →{' '}
                    {timetable.DailyTrainInfo.EndingStationName.Zh_tw}
                  </span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  日期：{timetable.TrainDate}
                </div>
              </div>

              <div className="relative">
                {/* 時間軸線 */}
                <div className="absolute left-[5.5rem] top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {timetable.StopTimes.map((stop, index) => (
                  <div key={stop.StopSequence} className="flex items-center py-2 relative">
                    <div className="w-20 text-right pr-4">
                      <div className="text-sm font-medium text-gray-800">
                        {stop.ArrivalTime.slice(0, 5)}
                      </div>
                      {stop.DepartureTime !== stop.ArrivalTime && (
                        <div className="text-xs text-gray-500">
                          發 {stop.DepartureTime.slice(0, 5)}
                        </div>
                      )}
                    </div>

                    {/* 站點圓點 */}
                    <div
                      className={`w-3 h-3 rounded-full border-2 z-10 ${
                        index === 0 || index === timetable.StopTimes.length - 1
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-400'
                      }`}
                    ></div>

                    <div className="ml-4">
                      <div
                        className={`font-medium ${
                          index === 0 || index === timetable.StopTimes.length - 1
                            ? 'text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {stop.StationName.Zh_tw}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
