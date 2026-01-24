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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        乘車日期
      </label>
      <input
        type="date"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={today}
        max={maxDateStr}
      />
    </div>
  );
}
