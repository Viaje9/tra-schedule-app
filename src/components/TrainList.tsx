import { useState, useMemo, useEffect, useRef } from 'react';
import type { DailyTrainTimetable } from '../types/train';
import { calculateDuration } from '../api/tdx';

interface TrainListProps {
  trains: DailyTrainTimetable[];
  loading: boolean;
  error: string | null;
  trainDate: string;
}

// 所有車型代碼
const ALL_TRAIN_TYPES = ['1', '2', '3', '4', '5', '6', '7', '10', '11'] as const;

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

// 已發車標籤
function DepartedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      已發車
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

// 判斷列車是否已發車
function isDeparted(train: DailyTrainTimetable, trainDate: string): boolean {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 只有查詢日期是今天才需要判斷已發車
  if (trainDate !== todayStr) {
    return false;
  }

  const depTime = train.OriginStopTime.DepartureTime;
  const delayMinutes = train.DelayTime ?? 0;
  const actualDepTime = addDelayToTime(depTime, delayMinutes);

  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return actualDepTime < currentTime;
}

// 車種簡稱對應
function getTrainTypeName(trainTypeCode: string): string {
  switch (trainTypeCode) {
    case '1': return '太魯閣';
    case '2': return '普悠瑪';
    case '3': return '自強';
    case '4': return '莒光';
    case '5': return '復興';
    case '6': return '區間';
    case '7': return '普快';
    case '10': return '區間快';
    case '11': return '新自強';
    default: return '其他';
  }
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
    case '7': // 普快
      return { bg: 'bg-amber-50', text: 'text-amber-700', accent: 'bg-amber-400' };
    case '10': // 區間快
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', accent: 'bg-cyan-500' };
    case '11': // 新自強 (EMU3000)
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', accent: 'bg-indigo-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', accent: 'bg-gray-400' };
  }
}

// localStorage keys
const STORAGE_KEY_TRAIN_TYPES = 'tra-filter-train-types';
const STORAGE_KEY_SHOW_DEPARTED = 'tra-filter-show-departed';

// 從 localStorage 讀取過濾設定
function loadFilterSettings(): { trainTypes: Set<string>; showDeparted: boolean } {
  try {
    const savedTypes = localStorage.getItem(STORAGE_KEY_TRAIN_TYPES);
    const savedShowDeparted = localStorage.getItem(STORAGE_KEY_SHOW_DEPARTED);

    const trainTypes = savedTypes
      ? new Set<string>(JSON.parse(savedTypes))
      : new Set(ALL_TRAIN_TYPES);
    const showDeparted = savedShowDeparted !== null
      ? JSON.parse(savedShowDeparted)
      : true;

    return { trainTypes, showDeparted };
  } catch {
    return { trainTypes: new Set(ALL_TRAIN_TYPES), showDeparted: true };
  }
}

export function TrainList({ trains, loading, error, trainDate }: TrainListProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<Set<string>>(() => loadFilterSettings().trainTypes);
  const [showDeparted, setShowDeparted] = useState(() => loadFilterSettings().showDeparted);
  const firstAvailableRef = useRef<HTMLDivElement>(null);
  const prevTrainsLength = useRef(0);

  // 儲存過濾設定到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRAIN_TYPES, JSON.stringify([...selectedTrainTypes]));
  }, [selectedTrainTypes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOW_DEPARTED, JSON.stringify(showDeparted));
  }, [showDeparted]);

  // 過濾列車
  const filteredTrains = useMemo(() => {
    return trains.filter((train) => {
      // 車型過濾
      if (!selectedTrainTypes.has(train.DailyTrainInfo.TrainTypeCode)) {
        return false;
      }
      // 已發車過濾
      if (!showDeparted && isDeparted(train, trainDate)) {
        return false;
      }
      return true;
    });
  }, [trains, selectedTrainTypes, showDeparted, trainDate]);

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

  const handleToggleTrainType = (typeCode: string) => {
    setSelectedTrainTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(typeCode)) {
        newSet.delete(typeCode);
      } else {
        newSet.add(typeCode);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedTrainTypes(new Set(ALL_TRAIN_TYPES));
  };

  const handleDeselectAll = () => {
    setSelectedTrainTypes(new Set());
  };

  const isAllSelected = selectedTrainTypes.size === ALL_TRAIN_TYPES.length;

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
        <div className="flex items-center gap-3">
          {/* 過濾按鈕 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilterMenu || !isAllSelected || !showDeparted
                  ? 'bg-[#3b6bdf] text-white'
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
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-20 p-4">
                  {/* 車型過濾 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">車型</span>
                      <button
                        type="button"
                        onClick={isAllSelected ? handleDeselectAll : handleSelectAll}
                        className="text-xs text-[#3b6bdf] hover:underline"
                      >
                        {isAllSelected ? '取消全選' : '全選'}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {ALL_TRAIN_TYPES.map((typeCode) => (
                        <label
                          key={typeCode}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTrainTypes.has(typeCode)}
                            onChange={() => handleToggleTrainType(typeCode)}
                            className="w-4 h-4 rounded border-gray-300 text-[#3b6bdf] focus:ring-[#3b6bdf]"
                          />
                          <span className="text-sm text-gray-600">{getTrainTypeName(typeCode)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 分隔線 */}
                  <div className="border-t border-gray-100 my-3"></div>

                  {/* 顯示已過站 */}
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2">
                    <input
                      type="checkbox"
                      checked={showDeparted}
                      onChange={(e) => setShowDeparted(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#3b6bdf] focus:ring-[#3b6bdf]"
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
          const duration = calculateDuration(
            train.OriginStopTime.DepartureTime,
            train.DestinationStopTime.ArrivalTime
          );
          const style = getTrainTypeStyle(train.DailyTrainInfo.TrainTypeCode);
          const departed = isDeparted(train, trainDate);
          const isFirstAvailable = index === firstAvailableIndex;

          return (
            <div
              key={train.DailyTrainInfo.TrainNo}
              ref={isFirstAvailable ? firstAvailableRef : undefined}
              className={`train-card w-full bg-white rounded-xl p-4 border border-gray-100 ${departed ? 'opacity-60' : ''}`}
            >
              {/* 頂部：車種標籤 + 車次 + 行駛時間 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#3b6bdf] font-bold font-mono">
                      {train.DailyTrainInfo.TrainNo}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.accent}`}></span>
                      {getTrainTypeName(train.DailyTrainInfo.TrainTypeCode)}
                    </span>
                  </div>
                  {departed && <DepartedBadge />}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
