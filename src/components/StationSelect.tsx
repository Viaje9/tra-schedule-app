import { useState, useMemo } from 'react';
import type { Station } from '../types/train';
import { MAJOR_STATION_CLASSES } from '../types/train';

interface StationSelectProps {
  stations: Station[];
  value: string;
  onChange: (stationId: string) => void;
  placeholder: string;
  label: string;
}

// 車站等級樣式
function getStationClassStyle(stationClass: string): string {
  switch (stationClass) {
    case '0':
      return 'bg-red-100 text-red-700';
    case '1':
      return 'bg-blue-100 text-blue-700';
    case '2':
      return 'bg-green-100 text-green-700';
    case '3':
      return 'bg-gray-100 text-gray-600';
    case '4':
      return 'bg-gray-50 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// 車站等級簡稱
function getStationClassLabel(stationClass: string): string {
  switch (stationClass) {
    case '0':
      return '特';
    case '1':
      return '一';
    case '2':
      return '二';
    case '3':
      return '三';
    case '4':
      return '簡';
    default:
      return '';
  }
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
  const [showAllStations, setShowAllStations] = useState(false);

  // 過濾車站
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // 先依車站等級過濾
    if (!showAllStations) {
      filtered = filtered.filter((station) =>
        MAJOR_STATION_CLASSES.includes(station.StationClass)
      );
    }

    // 再依搜尋文字過濾
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      // 如果有搜尋文字，顯示所有符合的車站（不管等級）
      filtered = stations.filter(
        (station) =>
          station.StationName.Zh_tw.includes(searchText) ||
          station.StationName.En.toLowerCase().includes(lowerSearch) ||
          station.StationID.includes(searchText)
      );
    }

    return filtered;
  }, [stations, searchText, showAllStations]);

  const selectedStation = useMemo(
    () => stations.find((s) => s.StationID === value),
    [stations, value]
  );

  // 計算主要車站和全部車站數量
  const majorStationsCount = useMemo(
    () => stations.filter((s) => MAJOR_STATION_CLASSES.includes(s.StationClass)).length,
    [stations]
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
          {/* 顯示全部車站切換 */}
          {!searchText && (
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllStations}
                  onChange={(e) => setShowAllStations(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                顯示全部車站
              </label>
              <span className="text-xs text-gray-400">
                {showAllStations ? stations.length : majorStationsCount} 站
              </span>
            </div>
          )}

          {/* 車站列表 */}
          <div className="overflow-auto flex-1">
            {filteredStations.length > 0 ? (
              filteredStations.slice(0, 50).map((station) => (
                <button
                  key={station.StationID}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center gap-2"
                  onClick={() => handleSelect(station.StationID)}
                >
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${getStationClassStyle(
                      station.StationClass
                    )}`}
                  >
                    {getStationClassLabel(station.StationClass)}
                  </span>
                  <span className="font-medium">{station.StationName.Zh_tw}</span>
                  <span className="text-gray-400 text-sm">
                    {station.StationName.En}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                找不到符合的車站
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
