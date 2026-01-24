import { useState, useMemo } from 'react';
import type { Station } from '../types/train';

interface StationSelectProps {
  stations: Station[];
  value: string;
  onChange: (stationId: string) => void;
  placeholder: string;
  label: string;
}

export function StationSelect({
  stations,
  value,
  onChange,
  placeholder,
  label,
}: StationSelectProps) {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredStations = useMemo(() => {
    if (!searchText) return stations;
    const lowerSearch = searchText.toLowerCase();
    return stations.filter(
      (station) =>
        station.StationName.Zh_tw.includes(searchText) ||
        station.StationName.En.toLowerCase().includes(lowerSearch) ||
        station.StationID.includes(searchText)
    );
  }, [stations, searchText]);

  const selectedStation = useMemo(
    () => stations.find((s) => s.StationID === value),
    [stations, value]
  );

  const handleSelect = (stationId: string) => {
    onChange(stationId);
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder={placeholder}
          value={isOpen ? searchText : (selectedStation?.StationName.Zh_tw || '')}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // 延遲關閉，讓點擊事件有時間執行
            setTimeout(() => setIsOpen(false), 200);
          }}
        />
        {value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              onChange('');
              setSearchText('');
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredStations.length > 0 ? (
            filteredStations.slice(0, 50).map((station) => (
              <button
                key={station.StationID}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                onClick={() => handleSelect(station.StationID)}
              >
                <span className="font-medium">{station.StationName.Zh_tw}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {station.StationName.En}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">找不到符合的車站</div>
          )}
        </div>
      )}
    </div>
  );
}
