import { getTodayDate } from '../api/tdx';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const today = getTodayDate();

  // 計算可選日期範圍（今天到 60 天後）
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // 格式化日期顯示
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '/');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="date"
          className="flex-1 bg-transparent text-gray-800 font-medium outline-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={today}
          max={maxDateStr}
        />
      </div>
    </div>
  );
}
