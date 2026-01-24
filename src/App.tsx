import { useState, useMemo, useEffect } from 'react';
import { DatePicker } from './components/DatePicker';
import { TimeRangePicker } from './components/TimeRangePicker';
import { TrainList } from './components/TrainList';
import { SettingsModal } from './components/SettingsModal';
import { StationPicker } from './components/StationPicker';
import { FavoriteRoutes } from './components/FavoriteRoutes';
import { useStations, useODQuery } from './hooks/useTrainQuery';
import { useFavoriteRoutes } from './hooks/useFavoriteRoutes';
import { getTodayDate, hasCredentials } from './api/tdx';

function App() {
  const [originStation, setOriginStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [trainDate, setTrainDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [, forceUpdate] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 監聽滾動，決定是否顯示回到頂部按鈕
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { stations, loading: stationsLoading, error: stationsError } = useStations();
  const { trains, loading: trainsLoading, error: trainsError, query: queryTrains } = useODQuery();
  const { routes, addRoute, removeRoute, hasRoute, canAddMore, maxRoutes } = useFavoriteRoutes();

  const originStationName = useMemo(
    () => stations.find((s) => s.StationID === originStation)?.StationName.Zh_tw,
    [stations, originStation]
  );

  const destStationName = useMemo(
    () => stations.find((s) => s.StationID === destinationStation)?.StationName.Zh_tw,
    [stations, destinationStation]
  );

  // 根據時間區間篩選班次
  const filteredTrains = useMemo(() => {
    if (!startTime && !endTime) return trains;

    return trains.filter((train) => {
      const depTime = train.OriginStopTime.DepartureTime;
      if (startTime && depTime < startTime) return false;
      if (endTime && depTime > endTime) return false;
      return true;
    });
  }, [trains, startTime, endTime]);

  const handleSearch = () => {
    if (originStation && destinationStation) {
      queryTrains(originStation, destinationStation, trainDate);
    }
  };

  const handleSwapStations = () => {
    setOriginStation(destinationStation);
    setDestinationStation(originStation);
  };

  const handleStationSelect = (origin: string, destination: string) => {
    setOriginStation(origin);
    setDestinationStation(destination);
  };

  const handleSaveRoute = () => {
    if (originStation && destinationStation && originStationName && destStationName) {
      addRoute(originStation, destinationStation, originStationName, destStationName);
    }
  };

  const handleSelectFavoriteRoute = (originId: string, destinationId: string) => {
    setOriginStation(originId);
    setDestinationStation(destinationId);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Header */}
      <header
        className="bg-[#2d3a4a] text-white"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Train Icon */}
            <div className="text-[#e5a835]">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">台鐵 e訂通</h1>
              <p className="text-gray-400 text-xs mt-0.5">TDX API 整合版 (Simulated)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#3d4d61] px-2 py-1 rounded">v2.1.0</span>
            <button
              type="button"
              className="p-2 hover:bg-[#3d4d61] rounded-lg transition-colors"
              onClick={() => setShowSettings(true)}
              title="API 設定"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 查詢表單 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 mb-6 animate-slide-up">
          {stationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3b6bdf] border-t-transparent"></div>
              <span className="ml-3 text-gray-500">載入車站資料...</span>
            </div>
          ) : stationsError ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
              {stationsError}
            </div>
          ) : (
            <div className="space-y-5">
              {/* 起訖站選擇 */}
              <div className="flex items-stretch gap-3">
                {/* 起站 */}
                <button
                  type="button"
                  onClick={() => setShowStationPicker(true)}
                  className="flex-1 text-left group min-w-0"
                >
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <span>出發</span>
                    <span className="text-gray-300">Origin</span>
                  </div>
                  <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                    originStation
                      ? 'border-transparent bg-gray-50 text-gray-800'
                      : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                  }`}>
                    <span className="text-xl font-semibold truncate block">
                      {originStationName || '選擇起站'}
                    </span>
                  </div>
                </button>

                {/* 交換按鈕 */}
                <div className="flex items-center pt-5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleSwapStations}
                    className="p-2 text-[#3b6bdf] hover:bg-blue-50 rounded-full transition-colors btn-press"
                    disabled={!originStation && !destinationStation}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                      <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                    </svg>
                  </button>
                </div>

                {/* 訖站 */}
                <button
                  type="button"
                  onClick={() => setShowStationPicker(true)}
                  className="flex-1 text-right group min-w-0"
                >
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center justify-end gap-1">
                    <span>抵達</span>
                    <span className="text-gray-300">Dest.</span>
                  </div>
                  <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                    destinationStation
                      ? 'border-transparent bg-gray-50 text-gray-800'
                      : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                  }`}>
                    <span className="text-xl font-semibold truncate block">
                      {destStationName || '選擇訖站'}
                    </span>
                  </div>
                </button>
              </div>

              {/* 常用路線 */}
              <FavoriteRoutes
                routes={routes}
                canAddMore={canAddMore}
                maxRoutes={maxRoutes}
                canSave={!!originStation && !!destinationStation}
                alreadyExists={hasRoute(originStation, destinationStation)}
                onSelectRoute={handleSelectFavoriteRoute}
                onSaveRoute={handleSaveRoute}
                onRemoveRoute={removeRoute}
              />

              {/* 日期選擇 */}
              <DatePicker value={trainDate} onChange={setTrainDate} />

              {/* 時間區間選擇 */}
              <TimeRangePicker
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />

              {/* 查詢按鈕 */}
              <button
                type="button"
                className="w-full bg-[#3b6bdf] hover:bg-[#2c5bd4] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press shadow-lg shadow-blue-500/20"
                onClick={handleSearch}
                disabled={!originStation || !destinationStation || trainsLoading || !hasCredentials()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{trainsLoading ? '查詢中...' : '查詢班次'}</span>
              </button>

              {/* 未設定 API 提示 */}
              {!hasCredentials() && (
                <div className="text-center text-sm text-gray-400">
                  請先
                  <button
                    type="button"
                    className="text-[#3b6bdf] hover:underline mx-1"
                    onClick={() => setShowSettings(true)}
                  >
                    設定 API 認證
                  </button>
                  才能查詢班次
                </div>
              )}
            </div>
          )}
        </div>

        {/* 查詢結果 */}
        {trains.length === 0 && !trainsLoading && !trainsError && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-gray-300 mb-4">
              <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <p className="text-gray-400">準備出發？點擊查詢按鈕</p>
          </div>
        )}

        <TrainList
          trains={filteredTrains}
          loading={trainsLoading}
          error={trainsError}
          trainDate={trainDate}
        />
      </main>

      {/* 車站選擇器 */}
      {showStationPicker && (
        <StationPicker
          stations={stations}
          originStation={originStation}
          destinationStation={destinationStation}
          onSelect={handleStationSelect}
          onClose={() => setShowStationPicker(false)}
        />
      )}

      {/* 設定 Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => forceUpdate({})}
      />

      {/* Footer */}
      <footer
        className="text-center pt-6 text-gray-400 text-xs"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <p>資料來源：TDX 運輸資料流通服務平台</p>
      </footer>

      {/* 回到頂部按鈕 */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-6 w-12 h-12 bg-white rounded-full shadow-lg shadow-gray-300/50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#3b6bdf] hover:border-[#3b6bdf]/20 transition-colors"
          style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
          title="回到頂部"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
