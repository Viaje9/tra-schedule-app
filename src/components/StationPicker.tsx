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

  // 依城市分組
  const stationsByCity = useMemo(() => {
    return groupStationsByCity(stations);
  }, [stations]);

  // 排序過的城市列表
  const sortedCities = useMemo(() => {
    return sortCities(Array.from(stationsByCity.keys()));
  }, [stationsByCity]);

  // 找出車站所屬城市
  const getStationCity = (stationId: string): string | null => {
    const station = stations.find(s => s.StationID === stationId);
    return station?.LocationCity || null;
  };

  // 初始化 selectedCity：優先選擇包含已選車站的城市
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const originCity = getStationCity(originStation);
    if (originCity) return originCity;
    const destCity = getStationCity(destinationStation);
    if (destCity) return destCity;
    return sortedCities[0] || '';
  });

  // 取得車站名稱
  const getStationName = (stationId: string) => {
    return stations.find(s => s.StationID === stationId)?.StationName.Zh_tw || '';
  };

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

  // 檢查車站的選中狀態：'origin' | 'destination' | null
  const getStationSelectionType = (stationId: string): 'origin' | 'destination' | null => {
    if (stationId === tempOrigin) return 'origin';
    if (stationId === tempDestination) return 'destination';
    return null;
  };

  // 檢查城市包含的已選車站類型
  const getCitySelectionType = (city: string): 'origin' | 'destination' | 'both' | null => {
    const cityStations = stationsByCity.get(city) || [];
    const hasOrigin = cityStations.some(s => s.StationID === tempOrigin);
    const hasDestination = cityStations.some(s => s.StationID === tempDestination);
    if (hasOrigin && hasDestination) return 'both';
    if (hasOrigin) return 'origin';
    if (hasDestination) return 'destination';
    return null;
  };

  // 當前城市的車站列表
  const currentCityStations = selectedCity ? stationsByCity.get(selectedCity) || [] : [];

  return (
    <div className="fixed inset-0 bg-[#f3f4f6] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#2d3a4a] text-white px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="p-1 hover:bg-[#3d4d61] rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-lg font-semibold">選擇車站</span>
        <button
          onClick={handleConfirm}
          disabled={!tempOrigin || !tempDestination}
          className="font-medium disabled:opacity-40 px-3 py-1 bg-[#3b6bdf] hover:bg-[#2c5bd4] rounded-lg transition-colors disabled:bg-transparent"
        >
          確定
        </button>
      </div>

      {/* 起訖站顯示 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => setActiveField('origin')}
          className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-lg font-semibold transition-all ${
            activeField === 'origin'
              ? 'border-[#3b6bdf] bg-blue-50 text-[#3b6bdf]'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="text-xs font-normal text-gray-400 mb-0.5">出發</div>
          {getStationName(tempOrigin) || '選擇起站'}
        </button>

        <button
          onClick={handleSwap}
          className="p-2 text-[#3b6bdf] hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
            <path d="M17 8V20M17 20L21 16M17 20L13 16" />
          </svg>
        </button>

        <button
          onClick={() => setActiveField('destination')}
          className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-lg font-semibold transition-all text-right ${
            activeField === 'destination'
              ? 'border-[#3b6bdf] bg-blue-50 text-[#3b6bdf]'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="text-xs font-normal text-gray-400 mb-0.5">抵達</div>
          {getStationName(tempDestination) || '選擇訖站'}
        </button>
      </div>

      {/* 搜尋框 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b6bdf] focus:ring-2 focus:ring-[#3b6bdf]/20 transition-all"
            placeholder="搜尋車站..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* 內容區域 */}
      {searchText ? (
        /* 搜尋結果 */
        <div className="flex-1 overflow-auto bg-white">
          {searchResults.length > 0 ? (
            searchResults.map((station) => {
              const selectionType = getStationSelectionType(station.StationID);
              const textColor = selectionType === 'origin' ? 'text-[#3b6bdf]' : selectionType === 'destination' ? 'text-[#f97316]' : 'text-gray-800';
              return (
                <button
                  key={station.StationID}
                  onClick={() => handleStationClick(station)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 text-left border-b border-gray-50 transition-colors"
                >
                  <div>
                    <span className={`${textColor} ${selectionType ? 'font-semibold' : 'font-medium'}`}>
                      {station.StationName.Zh_tw}
                    </span>
                    {station.LocationCity && (
                      <span className="text-gray-400 text-sm ml-2">{station.LocationCity}</span>
                    )}
                  </div>
                  {selectionType && (
                    <svg className={`w-5 h-5 ${selectionType === 'origin' ? 'text-[#3b6bdf]' : 'text-[#f97316]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-12 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              找不到符合的車站
            </div>
          )}
        </div>
      ) : (
        /* 雙欄佈局 */
        <div className="flex-1 flex overflow-hidden">
          {/* 左欄：城市列表 */}
          <div className="w-2/5 overflow-y-auto bg-white border-r border-gray-200">
            {sortedCities.map((city) => {
              const isSelected = city === selectedCity;
              const citySelectionType = getCitySelectionType(city);
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full px-4 py-3.5 flex items-center justify-between text-left border-b border-gray-100 transition-colors ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={isSelected ? 'text-[#3b6bdf] font-semibold' : 'text-gray-800 font-medium'}>
                    {city}
                  </span>
                  <div className="flex items-center gap-1">
                    {(citySelectionType === 'origin' || citySelectionType === 'both') && (
                      <svg className="w-5 h-5 text-[#3b6bdf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {(citySelectionType === 'destination' || citySelectionType === 'both') && (
                      <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 右欄：車站列表 */}
          <div className="w-3/5 overflow-y-auto bg-white">
            {currentCityStations.map((station) => {
              const selectionType = getStationSelectionType(station.StationID);
              const textColor = selectionType === 'origin' ? 'text-[#3b6bdf]' : selectionType === 'destination' ? 'text-[#f97316]' : 'text-gray-800';
              return (
                <button
                  key={station.StationID}
                  onClick={() => handleStationClick(station)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 text-left border-b border-gray-100 transition-colors"
                >
                  <span className={`${textColor} ${selectionType ? 'font-semibold' : 'font-medium'}`}>
                    {station.StationName.Zh_tw}
                  </span>
                  {selectionType && (
                    <svg className={`w-5 h-5 ${selectionType === 'origin' ? 'text-[#3b6bdf]' : 'text-[#f97316]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
