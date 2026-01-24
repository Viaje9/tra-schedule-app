import { useState, useMemo } from 'react';
import type { Station } from '../types/train';

interface StationPickerProps {
  stations: Station[];
  originStation: string;
  destinationStation: string;
  onSelect: (origin: string, destination: string) => void;
  onClose: () => void;
}

// 城市排序（由北到南）
const CITY_ORDER = [
  '基隆市', '臺北市', '新北市', '桃園市', '新竹市', '新竹縣',
  '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣',
  '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣',
  '臺東縣', '花蓮縣', '宜蘭縣'
];

// 依城市分組車站
function groupStationsByCity(stations: Station[]): Map<string, Station[]> {
  const grouped = new Map<string, Station[]>();

  stations.forEach(station => {
    const city = station.LocationCity || '其他';
    if (!grouped.has(city)) {
      grouped.set(city, []);
    }
    grouped.get(city)!.push(station);
  });

  return grouped;
}

// 排序城市
function sortCities(cities: string[]): string[] {
  return cities.sort((a, b) => {
    const indexA = CITY_ORDER.indexOf(a);
    const indexB = CITY_ORDER.indexOf(b);

    // 如果都在排序列表中，按列表順序
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // 如果只有 a 在列表中，a 排前面
    if (indexA !== -1) return -1;
    // 如果只有 b 在列表中，b 排前面
    if (indexB !== -1) return 1;
    // 都不在列表中，按字母順序
    return a.localeCompare(b, 'zh-TW');
  });
}

export function StationPicker({
  stations,
  originStation,
  destinationStation,
  onSelect,
  onClose,
}: StationPickerProps) {
  const [tempOrigin, setTempOrigin] = useState(originStation);
  const [tempDestination, setTempDestination] = useState(destinationStation);
  const [activeField, setActiveField] = useState<'origin' | 'destination'>('origin');
  const [searchText, setSearchText] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // 取得車站名稱
  const getStationName = (stationId: string) => {
    return stations.find(s => s.StationID === stationId)?.StationName.Zh_tw || '';
  };

  // 依城市分組
  const stationsByCity = useMemo(() => {
    return groupStationsByCity(stations);
  }, [stations]);

  // 排序過的城市列表
  const sortedCities = useMemo(() => {
    return sortCities(Array.from(stationsByCity.keys()));
  }, [stationsByCity]);

  // 搜尋結果（跨城市搜尋）
  const searchResults = useMemo(() => {
    if (!searchText) return [];
    const lowerSearch = searchText.toLowerCase();
    return stations.filter(
      s =>
        s.StationName.Zh_tw.includes(searchText) ||
        s.StationName.En.toLowerCase().includes(lowerSearch)
    ).slice(0, 30);
  }, [stations, searchText]);

  // 選擇車站
  const handleStationClick = (station: Station) => {
    if (activeField === 'origin') {
      setTempOrigin(station.StationID);
      setActiveField('destination');
    } else {
      setTempDestination(station.StationID);
    }
    setSearchText('');
    setSelectedCity(null);
  };

  // 交換起訖站
  const handleSwap = () => {
    setTempOrigin(tempDestination);
    setTempDestination(tempOrigin);
  };

  // 確定選擇
  const handleConfirm = () => {
    onSelect(tempOrigin, tempDestination);
    onClose();
  };

  // 返回城市列表
  const handleBackToCity = () => {
    setSelectedCity(null);
  };

  // 檢查是否為選中的車站
  const isSelected = (stationId: string) => {
    if (activeField === 'origin') {
      return stationId === tempOrigin;
    }
    return stationId === tempDestination;
  };

  // 當前城市的車站列表
  const currentCityStations = selectedCity ? stationsByCity.get(selectedCity) || [] : [];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-teal-500 text-white px-4 py-3 flex items-center justify-between">
        {selectedCity ? (
          <button onClick={handleBackToCity} className="p-1 flex items-center gap-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </button>
        ) : (
          <button onClick={onClose} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <span className="text-lg font-medium">
          {selectedCity ? selectedCity : '選擇車站'}
        </span>
        <button
          onClick={handleConfirm}
          disabled={!tempOrigin || !tempDestination}
          className="font-medium disabled:opacity-50 px-2"
        >
          確定
        </button>
      </div>

      {/* 搜尋框 */}
      <div className="px-4 py-2 bg-gray-100 border-b">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          placeholder="搜尋車站..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* 起訖站顯示 */}
      <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
        <div className="flex-1">
          <div className="text-xs text-teal-600 mb-1">出發</div>
          <button
            onClick={() => setActiveField('origin')}
            className={`w-full py-2 px-4 rounded-lg border-2 text-lg font-medium transition-colors ${
              activeField === 'origin'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {getStationName(tempOrigin) || '選擇起站'}
          </button>
        </div>

        <button
          onClick={handleSwap}
          className="p-2 text-teal-500 hover:bg-teal-50 rounded-full mt-5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="flex-1">
          <div className="text-xs text-teal-600 mb-1 text-right">抵達</div>
          <button
            onClick={() => setActiveField('destination')}
            className={`w-full py-2 px-4 rounded-lg border-2 text-lg font-medium transition-colors ${
              activeField === 'destination'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {getStationName(tempDestination) || '選擇訖站'}
          </button>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-auto">
        {searchText ? (
          /* 搜尋結果 */
          <div className="divide-y">
            {searchResults.length > 0 ? (
              searchResults.map((station) => (
                <button
                  key={station.StationID}
                  onClick={() => handleStationClick(station)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                >
                  <div>
                    <span className="text-gray-800">{station.StationName.Zh_tw}</span>
                    {station.LocationCity && (
                      <span className="text-gray-400 text-sm ml-2">{station.LocationCity}</span>
                    )}
                  </div>
                  {isSelected(station.StationID) && (
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">找不到符合的車站</div>
            )}
          </div>
        ) : selectedCity ? (
          /* 車站列表（第二層） */
          <div className="divide-y">
            {currentCityStations.map((station) => (
              <button
                key={station.StationID}
                onClick={() => handleStationClick(station)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
              >
                <span className={isSelected(station.StationID) ? 'text-teal-600 font-medium' : 'text-gray-800'}>
                  {station.StationName.Zh_tw}
                </span>
                {isSelected(station.StationID) && (
                  <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* 城市列表（第一層） */
          <div className="divide-y">
            {sortedCities.map((city) => {
              const cityStations = stationsByCity.get(city) || [];
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                >
                  <span className="text-gray-800">{city}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">({cityStations.length})</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
