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
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#2d3a4a] to-[#3d4d61]">
          <h2 className="text-lg font-semibold text-white">
            {loading ? '載入中...' : timetable ? `${timetable.DailyTrainInfo.TrainNo} 次列車` : '車次詳情'}
          </h2>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-auto max-h-[calc(85vh-4rem)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-[#3b6bdf]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#3b6bdf] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="mt-4 text-gray-500">載入時刻表...</span>
            </div>
          )}

          {error && (
            <div className="m-4 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {timetable && (
            <div className="p-5">
              {/* 列車資訊卡片 */}
              <div className="mb-5 p-4 bg-gradient-to-br from-[#3b6bdf]/10 to-[#3b6bdf]/5 rounded-xl border border-[#3b6bdf]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#3b6bdf] text-white rounded-lg text-sm font-medium">
                      {timetable.DailyTrainInfo.TrainTypeName.Zh_tw}
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {timetable.TrainDate}
                  </div>
                </div>
                <div className="mt-3 flex items-center text-gray-700">
                  <span className="font-medium">{timetable.DailyTrainInfo.StartingStationName.Zh_tw}</span>
                  <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-medium">{timetable.DailyTrainInfo.EndingStationName.Zh_tw}</span>
                </div>
              </div>

              {/* 時刻表 */}
              <div className="relative">
                {/* 時間軸線 */}
                <div className="absolute left-[4.5rem] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#3b6bdf] via-gray-200 to-[#3b6bdf]"></div>

                {timetable.StopTimes.map((stop, index) => {
                  const isFirst = index === 0;
                  const isLast = index === timetable.StopTimes.length - 1;
                  const isEndpoint = isFirst || isLast;

                  return (
                    <div key={stop.StopSequence} className="flex items-center py-2.5 relative">
                      {/* 時間 */}
                      <div className="w-16 text-right pr-4">
                        <div className={`text-sm font-semibold ${isEndpoint ? 'text-[#3b6bdf]' : 'text-gray-700'}`}>
                          {stop.ArrivalTime.slice(0, 5)}
                        </div>
                        {stop.DepartureTime !== stop.ArrivalTime && (
                          <div className="text-xs text-gray-400">
                            發 {stop.DepartureTime.slice(0, 5)}
                          </div>
                        )}
                      </div>

                      {/* 站點圓點 */}
                      <div className="relative z-10 flex items-center justify-center w-6">
                        <div
                          className={`rounded-full border-2 ${
                            isEndpoint
                              ? 'w-4 h-4 bg-[#3b6bdf] border-[#3b6bdf] shadow-lg shadow-blue-500/30'
                              : 'w-2.5 h-2.5 bg-white border-gray-300'
                          }`}
                        ></div>
                      </div>

                      {/* 站名 */}
                      <div className="ml-3 flex-1">
                        <div
                          className={`font-medium ${
                            isEndpoint ? 'text-[#3b6bdf] text-base' : 'text-gray-600 text-sm'
                          }`}
                        >
                          {stop.StationName.Zh_tw}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
