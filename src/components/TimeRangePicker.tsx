import { useState, useRef, useEffect } from 'react';

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

// 產生小時選項 (00 ~ 24)
const HOURS = Array.from({ length: 25 }, (_, i) => i);

interface HourPickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder: string;
}

function HourPicker({ value, onChange, placeholder }: HourPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayValue = value ? value.replace(':00', '') + ' 點' : placeholder;
  const selectedHour = value ? parseInt(value.split(':')[0]) : -1;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border text-left font-medium transition-colors ${
          value
            ? 'bg-gray-50 border-gray-200 text-gray-800'
            : 'bg-gray-50 border-gray-200 text-gray-400'
        } ${isOpen ? 'border-[#3b6bdf] ring-1 ring-[#3b6bdf]/20' : 'hover:border-gray-300'}`}
      >
        {displayValue}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-5 gap-1">
            {HOURS.map((hour) => {
              const timeValue = `${hour.toString().padStart(2, '0')}:00`;
              const isSelected = selectedHour === hour;
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => {
                    onChange(timeValue);
                    setIsOpen(false);
                  }}
                  className={`py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#3b6bdf] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
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
