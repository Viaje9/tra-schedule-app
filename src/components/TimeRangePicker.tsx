import { useState, useRef, useEffect, useCallback } from 'react';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

type TimePreset = {
  label: string;
  start: string;
  end: string;
};

const TIME_PRESETS: TimePreset[] = [
  { label: '上午', start: '06:00', end: '12:00' },
  { label: '下午', start: '12:00', end: '18:00' },
  { label: '晚上', start: '18:00', end: '24:00' },
];

// 小時選項 (0 ~ 24)
const HOURS = Array.from({ length: 25 }, (_, i) => i);
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
  value: number;
  onChange: (hour: number) => void;
  onClose: () => void;
}

function WheelPicker({ value, onChange, onClose }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedHour, setSelectedHour] = useState(value >= 0 ? value : 12);
  const isTouchingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 建立循環資料：複製 3 組
  const items = [...HOURS, ...HOURS, ...HOURS];
  const middleOffset = HOURS.length;

  // 初始化滾動位置到中間組
  useEffect(() => {
    if (scrollRef.current) {
      const targetIndex = middleOffset + selectedHour;
      scrollRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
    }
  }, []);

  // 吸附到最近的選項
  const snapToNearest = useCallback(() => {
    if (!scrollRef.current || isAnimatingRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const hour = items[index] ?? 0;
    const targetScroll = index * ITEM_HEIGHT;

    setSelectedHour(hour);

    // 需要吸附
    if (Math.abs(scrollTop - targetScroll) > 1) {
      isAnimatingRef.current = true;
      scrollRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isAnimatingRef.current = false;
        onChange(hour);
        // 循環處理
        handleLoop(index, hour);
      }, 200);
    } else {
      onChange(hour);
      // 循環處理
      handleLoop(index, hour);
    }
  }, [items, onChange]);

  // 循環處理：如果滾到頭尾，跳回中間
  const handleLoop = useCallback((index: number, hour: number) => {
    if (!scrollRef.current) return;

    if (index < HOURS.length / 2 || index >= middleOffset + HOURS.length + HOURS.length / 2) {
      // 延遲一下再跳，避免視覺閃爍
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = (middleOffset + hour) * ITEM_HEIGHT;
        }
      }, 50);
    }
  }, [middleOffset]);

  // 觸控開始
  const handleTouchStart = useCallback(() => {
    isTouchingRef.current = true;
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }
  }, []);

  // 觸控結束 - 等手指放開才決定
  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
    // 等滾動慣性結束後再吸附
    settleTimeoutRef.current = setTimeout(() => {
      snapToNearest();
    }, 150);
  }, [snapToNearest]);

  // 滾動事件 - 只更新視覺，不做選擇
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const hour = items[index] ?? 0;

    // 只更新顯示的選中狀態，不觸發 onChange
    setSelectedHour(hour);

    // 如果不是觸控中且不是動畫中，設定延遲吸附（處理滑鼠滾輪）
    if (!isTouchingRef.current && !isAnimatingRef.current) {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
      settleTimeoutRef.current = setTimeout(() => {
        snapToNearest();
      }, 150);
    }
  }, [items, snapToNearest]);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 清理
  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (index: number) => {
    if (!scrollRef.current) return;
    isAnimatingRef.current = true;
    scrollRef.current.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: 'smooth',
    });
    setTimeout(() => {
      isAnimatingRef.current = false;
      const hour = items[index] ?? 0;
      setSelectedHour(hour);
      onChange(hour);
      onClose();
    }, 200);
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      {/* 關閉按鈕 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 z-30 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 滾輪區域 */}
      <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
        {/* 選中區域高亮 */}
        <div
          className="absolute left-0 right-0 bg-[#3b6bdf]/10 border-y border-[#3b6bdf]/20 pointer-events-none z-10"
          style={{
            top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            height: ITEM_HEIGHT,
          }}
        />
        {/* 漸變遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />

        {/* 滾動容器 */}
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto scrollbar-hide overscroll-contain"
          style={{
            paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          {items.map((hour, index) => {
            const isSelected = hour === selectedHour && index >= middleOffset && index < middleOffset + HOURS.length;
            return (
              <div
                key={index}
                className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                  isSelected ? 'text-[#3b6bdf] font-bold text-2xl' : 'text-gray-400 text-lg'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                }}
                onClick={() => handleItemClick(index)}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface HourPickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder: string;
}

function HourPicker({ value, onChange, placeholder }: HourPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = value ? value.replace(':00', '') + ' 點' : placeholder;
  const selectedHour = value ? parseInt(value.split(':')[0]) : -1;

  const handleChange = (hour: number) => {
    onChange(`${hour.toString().padStart(2, '0')}:00`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border text-center font-medium transition-colors ${
          value
            ? 'bg-gray-50 border-gray-200 text-gray-800'
            : 'bg-gray-50 border-gray-200 text-gray-400'
        } ${isOpen ? 'border-[#3b6bdf] ring-1 ring-[#3b6bdf]/20' : 'hover:border-gray-300'}`}
      >
        {displayValue}
      </button>

      {isOpen && (
        <WheelPicker
          value={selectedHour}
          onChange={handleChange}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangePickerProps) {
  const handlePresetClick = (preset: TimePreset) => {
    onStartTimeChange(preset.start);
    onEndTimeChange(preset.end);
  };

  const handleClearAll = () => {
    onStartTimeChange('');
    onEndTimeChange('');
  };

  const isPresetActive = (preset: TimePreset) => {
    return startTime === preset.start && endTime === preset.end;
  };

  const hasTimeFilter = startTime || endTime;

  return (
    <div className="relative">
      <div className="py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        {/* 時間選擇 */}
        <div className="flex items-center gap-2">
          <div className="text-gray-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <HourPicker
            value={startTime}
            onChange={onStartTimeChange}
            placeholder="起"
          />
          <span className="text-gray-400 flex-shrink-0">~</span>
          <HourPicker
            value={endTime}
            onChange={onEndTimeChange}
            placeholder="迄"
          />
        </div>

        {/* 快速選擇按鈕 */}
        <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isPresetActive(preset)
                  ? 'bg-[#3b6bdf] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ml-auto ${
              !hasTimeFilter
                ? 'bg-[#3b6bdf] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
        </div>
      </div>
    </div>
  );
}
