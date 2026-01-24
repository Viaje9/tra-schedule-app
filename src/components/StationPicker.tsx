import { useState, useMemo } from 'react';
import type { Station } from '../types/train';
import { MAJOR_STATION_CLASSES } from '../types/train';

interface StationPickerProps {
  stations: Station[];
  originStation: string;
  destinationStation: string;
  onSelect: (origin: string, destination: string) => void;
  onClose: () => void;
}

// 定義主要車站（按路線順序）
const MAIN_STATIONS_LEFT = [
  '基隆', '臺北', '新北', '桃園', '新竹', '苗栗', '臺中', '彰化', '南投', '雲林'
];

const MAIN_STATIONS_RIGHT = [
  '嘉義', '臺南', '高雄', '屏東', '臺東', '花蓮', '宜蘭', '新左營', '板橋', '松山'
];

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
  const [showSearch, setShowSearch] = useState(false);

  // 取得車站名稱
  const getStationName = (stationId: string) => {
    return stations.find(s => s.StationID === stationId)?.StationName.Zh_tw || '';
  };

  // 根據名稱找車站
  const findStationByName = (name: string) => {
    return stations.find(s => s.StationName.Zh_tw === name);
  };

  // 主要車站列表（左欄）
  const leftStations = useMemo(() => {
    return MAIN_STATIONS_LEFT.map(name => findStationByName(name)).filter(Boolean) as Station[];
  }, [stations]);

  // 主要車站列表（右欄）
  const rightStations = useMemo(() => {
    return MAIN_STATIONS_RIGHT.map(name => findStationByName(name)).filter(Boolean) as Station[];
  }, [stations]);

  // 搜尋結果
  const searchResults = useMemo(() => {
    if (!searchText) return [];
    const lowerSearch = searchText.toLowerCase();
    return stations.filter(
      s =>
        s.StationName.Zh_tw.includes(searchText) ||
        s.StationName.En.toLowerCase().includes(lowerSearch)
    ).slice(0, 20);
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
    setShowSearch(false);
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

  // 檢查是否為選中的車站
  const isSelected = (stationId: string) => {
    if (activeField === 'origin') {
      return stationId === tempOrigin;
    }
    return stationId === tempDestination;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-teal-500 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-medium">選擇車站</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSearch(!showSearch)} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tempOrigin || !tempDestination}
            className="font-medium disabled:opacity-50"
          >
            確定
          </button>
        </div>
      </div>

      {/* 搜尋框 */}
      {showSearch && (
        <div className="px-4 py-2 bg-gray-100 border-b">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="搜尋車站..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
          />
        </div>
      )}

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

      {/* 車站列表 */}
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
                  <span className="text-gray-800">{station.StationName.Zh_tw}</span>
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
        ) : (
          /* 兩欄車站列表 */
          <div className="flex divide-x h-full">
            {/* 左欄 */}
            <div className="flex-1 divide-y">
              {leftStations.map((station) => (
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

            {/* 右欄 */}
            <div className="flex-1 divide-y">
              {rightStations.map((station) => (
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
          </div>
        )}
      </div>

      {/* 提示：顯示更多車站 */}
      {!searchText && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full text-center text-sm text-teal-600 hover:text-teal-700"
          >
            點擊搜尋查看更多車站
          </button>
        </div>
      )}
    </div>
  );
}
