import { useState, useMemo, useEffect, useRef } from 'react';
import type { ThsrTimetable } from '../types/thsr';
import { calculateThsrDuration } from '../api/thsr';

interface ThsrTrainListProps {
  trains: ThsrTimetable[];
  loading: boolean;
  error: string | null;
  trainDate: string;
}

// localStorage key
const STORAGE_KEY_SHOW_DEPARTED = 'thsr-filter-show-departed';

// 已發車標籤
function DepartedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      已發車
    </span>
  );
}

// 判斷列車是否已發車
function isDeparted(train: ThsrTimetable, trainDate: string): boolean {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 只有查詢日期是今天才需要判斷已發車
  if (trainDate !== todayStr) {
    return false;
  }

  const depTime = train.OriginStopTime.DepartureTime;
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return depTime < currentTime;
}

// 從 localStorage 讀取過濾設定
function loadFilterSettings(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHOW_DEPARTED);
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
}

export function ThsrTrainList({ trains, loading, error, trainDate }: ThsrTrainListProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDeparted, setShowDeparted] = useState(() => loadFilterSettings());
  const firstAvailableRef = useRef<HTMLDivElement>(null);
  const prevTrainsLength = useRef(0);

  // 儲存過濾設定到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_DEPARTED, JSON.stringify(showDeparted));
  }, [showDeparted]);

  // 過濾列車
  const filteredTrains = useMemo(() => {
    return trains.filter((train) => {
      if (!showDeparted && isDeparted(train, trainDate)) {
        return false;
      }
      return true;
    });
  }, [trains, showDeparted, trainDate]);

  // 找出第一個未發車列車的索引
  const firstAvailableIndex = useMemo(() => {
    return filteredTrains.findIndex((train) => !isDeparted(train, trainDate));
  }, [filteredTrains, trainDate]);

  // 查詢完成後滾動到第一個未發車的列車
  useEffect(() => {
    if (trains.length > 0 && prevTrainsLength.current === 0 && firstAvailableRef.current) {
      firstAvailableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevTrainsLength.current = trains.length;
  }, [trains.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-[#ff6b00]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="flex items-center gap-3">
          {/* 過濾按鈕 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilterMenu || !showDeparted
                  ? 'bg-[#ff6b00] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              過濾
            </button>

            {/* 過濾選單 */}
            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 p-4">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2">
                    <input
                      type="checkbox"
                      checked={showDeparted}
                      onChange={(e) => setShowDeparted(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#ff6b00] focus:ring-[#ff6b00]"
                    />
                    <span className="text-sm text-gray-600">顯示已過站</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <span className="text-sm text-gray-400">
            共 {filteredTrains.length} 班次
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {filteredTrains.map((train, index) => {
          const duration = calculateThsrDuration(
            train.OriginStopTime.DepartureTime,
            train.DestinationStopTime.ArrivalTime
          );
          const departed = isDeparted(train, trainDate);
          const isFirstAvailable = index === firstAvailableIndex;

          return (
            <div
              key={train.DailyTrainInfo.TrainNo}
              ref={isFirstAvailable ? firstAvailableRef : undefined}
              className={`train-card w-full bg-white rounded-xl p-4 border border-gray-100 ${departed ? 'opacity-60' : ''}`}
            >
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3 inline-flex items-center gap-2">
                <span>列車始終站：</span>
                <span className="font-medium text-gray-700">
                  {train.DailyTrainInfo.StartingStationName?.Zh_tw || train.OriginStopTime.StationName.Zh_tw} → {train.DailyTrainInfo.EndingStationName?.Zh_tw || train.DestinationStopTime.StationName.Zh_tw}
                </span>
              </div>

              {/* 頂部：車次 + 行駛時間 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ff6b00] font-bold font-mono text-lg">
                      {train.DailyTrainInfo.TrainNo}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium bg-orange-50 text-orange-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      高鐵
                    </span>
                  </div>
                  {departed && <DepartedBadge />}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{duration}</span>
                </div>
              </div>

              {/* 時間與站名 */}
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">
                    {train.OriginStopTime.DepartureTime.slice(0, 5)}
                  </div>
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
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-3xl font-bold text-gray-800 tracking-tight">
                    {train.DestinationStopTime.ArrivalTime.slice(0, 5)}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {train.DestinationStopTime.StationName.Zh_tw}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
