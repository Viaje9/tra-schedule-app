import type { DailyTrainTimetable } from '../types/train';
import { calculateDuration } from '../api/tdx';

interface TrainListProps {
  trains: DailyTrainTimetable[];
  loading: boolean;
  error: string | null;
  onTrainClick: (trainNo: string, trainDate: string) => void;
}

// 延誤狀態標籤
function DelayBadge({ delayTime }: { delayTime: number | undefined }) {
  if (delayTime === undefined) {
    return null;
  }

  if (delayTime === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        準點
      </span>
    );
  }

  // 延誤 10 分鐘以上用紅色，否則用橘色
  const isSerious = delayTime >= 10;
  const colorClasses = isSerious
    ? 'bg-red-50 text-red-600'
    : 'bg-amber-50 text-amber-600';
  const dotColor = isSerious ? 'bg-red-500' : 'bg-amber-500';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      延誤 {delayTime} 分
    </span>
  );
}

// 計算加上延誤後的實際時間
function addDelayToTime(time: string, delayMinutes: number): string {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + delayMinutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

// 車種顏色對應
function getTrainTypeStyle(trainTypeCode: string): { bg: string; text: string; accent: string } {
  switch (trainTypeCode) {
    case '1': // 太魯閣
      return { bg: 'bg-rose-50', text: 'text-rose-700', accent: 'bg-rose-500' };
    case '2': // 普悠瑪
      return { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-500' };
    case '3': // 自強
      return { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'bg-blue-500' };
    case '4': // 莒光
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500' };
    case '5': // 復興
      return { bg: 'bg-violet-50', text: 'text-violet-700', accent: 'bg-violet-500' };
    case '6': // 區間
      return { bg: 'bg-slate-50', text: 'text-slate-600', accent: 'bg-slate-400' };
    case '7': // 區間快
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', accent: 'bg-cyan-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', accent: 'bg-gray-400' };
  }
}

export function TrainList({ trains, loading, error, onTrainClick }: TrainListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#3b6bdf]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#3b6bdf] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="mt-4 text-gray-500">查詢班次中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm animate-fade-in">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (trains.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          查詢結果
        </h2>
        <span className="text-sm text-gray-400">
          共 {trains.length} 班次
        </span>
      </div>
      <div className="space-y-3">
        {trains.map((train) => {
          const duration = calculateDuration(
            train.OriginStopTime.DepartureTime,
            train.DestinationStopTime.ArrivalTime
          );
          const style = getTrainTypeStyle(train.DailyTrainInfo.TrainTypeCode);

          return (
            <button
              key={train.DailyTrainInfo.TrainNo}
              type="button"
              className="train-card w-full bg-white rounded-xl p-4 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200 text-left border border-gray-100 group"
              onClick={() => onTrainClick(train.DailyTrainInfo.TrainNo, train.TrainDate)}
            >
              {/* 頂部：車種標籤 + 車次 + 行駛時間 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#3b6bdf] font-bold font-mono">
                    {train.DailyTrainInfo.TrainNo}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.accent}`}></span>
                    {train.DailyTrainInfo.TrainTypeName.Zh_tw}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DelayBadge delayTime={train.DelayTime} />
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{duration}</span>
                  </div>
                </div>
              </div>

              {/* 時間與站名 */}
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">
                    {train.OriginStopTime.DepartureTime.slice(0, 5)}
                  </div>
                  {train.DelayTime !== undefined && train.DelayTime > 0 && (
                    <div className="text-base text-red-500 mt-0.5">
                      {addDelayToTime(train.OriginStopTime.DepartureTime, train.DelayTime)}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mt-0.5">
                    {train.OriginStopTime.StationName.Zh_tw}
                  </div>
                </div>

                <div className="flex-1 px-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                    </div>
                    <div className="relative bg-white px-2">
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-[#3b6bdf] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">
                    {train.DestinationStopTime.ArrivalTime.slice(0, 5)}
                  </div>
                  {train.DelayTime !== undefined && train.DelayTime > 0 && (
                    <div className="text-base text-red-500 mt-0.5">
                      {addDelayToTime(train.DestinationStopTime.ArrivalTime, train.DelayTime)}
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mt-0.5">
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
