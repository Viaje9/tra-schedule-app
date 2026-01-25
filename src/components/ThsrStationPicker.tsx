import { useState, useMemo } from 'react';
import type { ThsrStation } from '../types/thsr';
import { THSR_STATION_ORDER } from '../types/thsr';

interface ThsrStationPickerProps {
  stations: ThsrStation[];
  originStation: string;
  destinationStation: string;
  onSelect: (origin: string, destination: string) => void;
  onClose: () => void;
}

export function ThsrStationPicker({
  stations,
  originStation,
  destinationStation,
  onSelect,
  onClose,
}: ThsrStationPickerProps) {
  const [tempOrigin, setTempOrigin] = useState(originStation);
  const [tempDestination, setTempDestination] = useState(destinationStation);
  const [activeField, setActiveField] = useState<'origin' | 'destination'>('origin');
  const [searchText, setSearchText] = useState('');

  // 依照北到南排序車站
  const sortedStations = useMemo(() => {
    return [...stations].sort((a, b) => {
      const indexA = THSR_STATION_ORDER.indexOf(a.StationID);
      const indexB = THSR_STATION_ORDER.indexOf(b.StationID);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [stations]);

  // 取得車站名稱
  const getStationName = (stationId: string) => {
    return stations.find(s => s.StationID === stationId)?.StationName.Zh_tw || '';
  };

  // 搜尋結果
  const searchResults = useMemo(() => {
    if (!searchText) return sortedStations;
    const lowerSearch = searchText.toLowerCase();
    return sortedStations.filter(
      s =>
        s.StationName.Zh_tw.includes(searchText) ||
        s.StationName.En.toLowerCase().includes(lowerSearch)
    );
  }, [sortedStations, searchText]);

  // 選擇車站
  const handleStationClick = (station: ThsrStation) => {
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

  // 檢查車站的選中狀態
  const getStationSelectionType = (stationId: string): 'origin' | 'destination' | null => {
    if (stationId === tempOrigin) return 'origin';
    if (stationId === tempDestination) return 'destination';
    return null;
  };

  return (
    <div className="fixed inset-0 bg-[#f3f4f6] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#ff6b00] text-white px-4 py-3 flex items-center justify-between safe-area-top">
        <button onClick={onClose} className="p-1 hover:bg-[#e55f00] rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-lg font-semibold">選擇車站</span>
        <button
          onClick={handleConfirm}
          disabled={!tempOrigin || !tempDestination}
          className="font-medium disabled:opacity-40 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:bg-transparent"
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
              ? 'border-[#ff6b00] bg-orange-50 text-[#ff6b00]'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="text-xs font-normal text-gray-400 mb-0.5">出發</div>
          {getStationName(tempOrigin) || '選擇起站'}
        </button>

        <button
          onClick={handleSwap}
          className="p-2 text-[#ff6b00] hover:bg-orange-50 rounded-full transition-colors flex-shrink-0"
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
              ? 'border-[#ff6b00] bg-orange-50 text-[#ff6b00]'
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all"
            placeholder="搜尋車站..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* 車站列表 */}
      <div className="flex-1 overflow-auto bg-white">
        {searchResults.length > 0 ? (
          searchResults.map((station) => {
            const selectionType = getStationSelectionType(station.StationID);
            const textColor = selectionType === 'origin' ? 'text-[#ff6b00]' : selectionType === 'destination' ? 'text-[#10b981]' : 'text-gray-800';
            return (
              <button
                key={station.StationID}
                onClick={() => handleStationClick(station)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 text-left border-b border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${textColor} ${selectionType ? 'font-semibold' : 'font-medium'}`}>
                    {station.StationName.Zh_tw}
                  </span>
                  <span className="text-sm text-gray-400">{station.StationName.En}</span>
                </div>
                {selectionType && (
                  <svg className={`w-5 h-5 ${selectionType === 'origin' ? 'text-[#ff6b00]' : 'text-[#10b981]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}
