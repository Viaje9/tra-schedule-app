import { useState, useMemo, useEffect } from 'react';
import { DatePicker } from './components/DatePicker';
import { TimeRangePicker } from './components/TimeRangePicker';
import { TrainList } from './components/TrainList';
import { ThsrTrainList } from './components/ThsrTrainList';
import { SettingsModal } from './components/SettingsModal';
import { StationPicker } from './components/StationPicker';
import { ThsrStationPicker } from './components/ThsrStationPicker';
import { FavoriteRoutes } from './components/FavoriteRoutes';
import { useStations, useODQuery } from './hooks/useTrainQuery';
import { useThsrStations, useThsrODQuery } from './hooks/useThsrQuery';
import { useFavoriteRoutes } from './hooks/useFavoriteRoutes';
import { getTodayDate, hasCredentials } from './api/tdx';

type TransportMode = 'tra' | 'thsr';

function App() {
  // 共用狀態
  const [mode, setMode] = useState<TransportMode>('tra');
  const [trainDate, setTrainDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [, forceUpdate] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 台鐵狀態
  const [traOriginStation, setTraOriginStation] = useState('');
  const [traDestinationStation, setTraDestinationStation] = useState('');
  const [showTraStationPicker, setShowTraStationPicker] = useState(false);

  // 高鐵狀態
  const [thsrOriginStation, setThsrOriginStation] = useState('');
  const [thsrDestinationStation, setThsrDestinationStation] = useState('');
  const [showThsrStationPicker, setShowThsrStationPicker] = useState(false);

  // 監聽滾動，決定是否顯示回到頂部按鈕
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 台鐵 Hooks
  const { stations: traStations, loading: traStationsLoading, error: traStationsError } = useStations();
  const { trains: traTrains, loading: traTrainsLoading, error: traTrainsError, query: queryTraTrains, reset: resetTraTrains } = useODQuery();
  const { routes: traRoutes, addRoute: addTraRoute, removeRoute: removeTraRoute, hasRoute: hasTraRoute, canAddMore: canAddMoreTraRoute, maxRoutes: traMaxRoutes } = useFavoriteRoutes();

  // 高鐵 Hooks
  const { stations: thsrStations, loading: thsrStationsLoading, error: thsrStationsError } = useThsrStations();
  const { trains: thsrTrains, loading: thsrTrainsLoading, error: thsrTrainsError, query: queryThsrTrains, reset: resetThsrTrains } = useThsrODQuery();

  // 台鐵車站名稱
  const traOriginStationName = useMemo(
    () => traStations.find((s) => s.StationID === traOriginStation)?.StationName.Zh_tw,
    [traStations, traOriginStation]
  );
  const traDestStationName = useMemo(
    () => traStations.find((s) => s.StationID === traDestinationStation)?.StationName.Zh_tw,
    [traStations, traDestinationStation]
  );

  // 高鐵車站名稱
  const thsrOriginStationName = useMemo(
    () => thsrStations.find((s) => s.StationID === thsrOriginStation)?.StationName.Zh_tw,
    [thsrStations, thsrOriginStation]
  );
  const thsrDestStationName = useMemo(
    () => thsrStations.find((s) => s.StationID === thsrDestinationStation)?.StationName.Zh_tw,
    [thsrStations, thsrDestinationStation]
  );

  // 根據時間區間篩選班次
  const filteredTraTrains = useMemo(() => {
    if (!startTime && !endTime) return traTrains;
    return traTrains.filter((train) => {
      const depTime = train.OriginStopTime.DepartureTime;
      if (startTime && depTime < startTime) return false;
      if (endTime && depTime > endTime) return false;
      return true;
    });
  }, [traTrains, startTime, endTime]);

  const filteredThsrTrains = useMemo(() => {
    if (!startTime && !endTime) return thsrTrains;
    return thsrTrains.filter((train) => {
      const depTime = train.OriginStopTime.DepartureTime;
      if (startTime && depTime < startTime) return false;
      if (endTime && depTime > endTime) return false;
      return true;
    });
  }, [thsrTrains, startTime, endTime]);

  // 切換模式時重置查詢結果
  const handleModeChange = (newMode: TransportMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      if (newMode === 'tra') {
        resetThsrTrains();
      } else {
        resetTraTrains();
      }
    }
  };

  // 台鐵查詢
  const handleTraSearch = () => {
    if (traOriginStation && traDestinationStation) {
      queryTraTrains(traOriginStation, traDestinationStation, trainDate);
    }
  };

  // 高鐵查詢
  const handleThsrSearch = () => {
    if (thsrOriginStation && thsrDestinationStation) {
      queryThsrTrains(thsrOriginStation, thsrDestinationStation, trainDate);
    }
  };

  // 台鐵交換起訖站
  const handleTraSwapStations = () => {
    setTraOriginStation(traDestinationStation);
    setTraDestinationStation(traOriginStation);
  };

  // 高鐵交換起訖站
  const handleThsrSwapStations = () => {
    setThsrOriginStation(thsrDestinationStation);
    setThsrDestinationStation(thsrOriginStation);
  };

  // 台鐵車站選擇
  const handleTraStationSelect = (origin: string, destination: string) => {
    setTraOriginStation(origin);
    setTraDestinationStation(destination);
  };

  // 高鐵車站選擇
  const handleThsrStationSelect = (origin: string, destination: string) => {
    setThsrOriginStation(origin);
    setThsrDestinationStation(destination);
  };

  // 台鐵儲存常用路線
  const handleTraSaveRoute = () => {
    if (traOriginStation && traDestinationStation && traOriginStationName && traDestStationName) {
      addTraRoute(traOriginStation, traDestinationStation, traOriginStationName, traDestStationName);
    }
  };

  // 台鐵選擇常用路線
  const handleSelectTraFavoriteRoute = (originId: string, destinationId: string) => {
    setTraOriginStation(originId);
    setTraDestinationStation(destinationId);
  };

  // 主題色
  const themeColor = mode === 'tra' ? '#3b6bdf' : '#ff6b00';
  const headerBg = mode === 'tra' ? '#2d3a4a' : '#1a1a2e';

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Header */}
      <header className="text-white safe-area-top" style={{ backgroundColor: headerBg }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Train Icon */}
            <div style={{ color: mode === 'tra' ? '#e5a835' : '#ff6b00' }}>
              {mode === 'tra' ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2h3.54l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM6 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S8.33 17 7.5 17 6 16.33 6 15.5zm4-5.5H6V7h4v3zm1 0V7h2v3h-2zm6 5.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM18 10h-4V7h4v3z"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                {mode === 'tra' ? '台鐵 e訂通' : '高鐵時刻表'}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">TDX API 整合版</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">v{__APP_VERSION__}</span>
            <button
              type="button"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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

        {/* Tab 切換 */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => handleModeChange('tra')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                mode === 'tra'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4z"/>
                </svg>
                台鐵
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('thsr')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                mode === 'thsr'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2h3.54l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4z"/>
                </svg>
                高鐵
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 查詢表單 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 mb-6 animate-slide-up">
          {/* 台鐵模式 */}
          {mode === 'tra' && (
            <>
              {traStationsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3b6bdf] border-t-transparent"></div>
                  <span className="ml-3 text-gray-500">載入車站資料...</span>
                </div>
              ) : traStationsError ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
                  {traStationsError}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* 起訖站選擇 */}
                  <div className="flex items-stretch gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTraStationPicker(true)}
                      className="flex-1 text-left group min-w-0"
                    >
                      <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                        <span>出發</span>
                        <span className="text-gray-300">Origin</span>
                      </div>
                      <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                        traOriginStation
                          ? 'border-transparent bg-gray-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                      }`}>
                        <span className="text-xl font-semibold truncate block">
                          {traOriginStationName || '選擇起站'}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center pt-5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleTraSwapStations}
                        className="p-2 text-[#3b6bdf] hover:bg-blue-50 rounded-full transition-colors btn-press"
                        disabled={!traOriginStation && !traDestinationStation}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                          <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTraStationPicker(true)}
                      className="flex-1 text-right group min-w-0"
                    >
                      <div className="text-xs text-gray-400 mb-1.5 flex items-center justify-end gap-1">
                        <span>抵達</span>
                        <span className="text-gray-300">Dest.</span>
                      </div>
                      <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                        traDestinationStation
                          ? 'border-transparent bg-gray-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                      }`}>
                        <span className="text-xl font-semibold truncate block">
                          {traDestStationName || '選擇訖站'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* 常用路線 */}
                  <FavoriteRoutes
                    routes={traRoutes}
                    canAddMore={canAddMoreTraRoute}
                    maxRoutes={traMaxRoutes}
                    canSave={!!traOriginStation && !!traDestinationStation}
                    alreadyExists={hasTraRoute(traOriginStation, traDestinationStation)}
                    onSelectRoute={handleSelectTraFavoriteRoute}
                    onSaveRoute={handleTraSaveRoute}
                    onRemoveRoute={removeTraRoute}
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
                    onClick={handleTraSearch}
                    disabled={!traOriginStation || !traDestinationStation || traTrainsLoading || !hasCredentials()}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{traTrainsLoading ? '查詢中...' : '查詢班次'}</span>
                  </button>

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
            </>
          )}

          {/* 高鐵模式 */}
          {mode === 'thsr' && (
            <>
              {thsrStationsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#ff6b00] border-t-transparent"></div>
                  <span className="ml-3 text-gray-500">載入車站資料...</span>
                </div>
              ) : thsrStationsError ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
                  {thsrStationsError}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* 起訖站選擇 */}
                  <div className="flex items-stretch gap-3">
                    <button
                      type="button"
                      onClick={() => setShowThsrStationPicker(true)}
                      className="flex-1 text-left group min-w-0"
                    >
                      <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                        <span>出發</span>
                        <span className="text-gray-300">Origin</span>
                      </div>
                      <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                        thsrOriginStation
                          ? 'border-transparent bg-orange-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                      }`}>
                        <span className="text-xl font-semibold truncate block">
                          {thsrOriginStationName || '選擇起站'}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center pt-5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleThsrSwapStations}
                        className="p-2 text-[#ff6b00] hover:bg-orange-50 rounded-full transition-colors btn-press"
                        disabled={!thsrOriginStation && !thsrDestinationStation}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                          <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowThsrStationPicker(true)}
                      className="flex-1 text-right group min-w-0"
                    >
                      <div className="text-xs text-gray-400 mb-1.5 flex items-center justify-end gap-1">
                        <span>抵達</span>
                        <span className="text-gray-300">Dest.</span>
                      </div>
                      <div className={`w-full py-3 px-3 rounded-xl border-2 transition-all duration-200 ${
                        thsrDestinationStation
                          ? 'border-transparent bg-orange-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-400 group-hover:border-gray-300'
                      }`}>
                        <span className="text-xl font-semibold truncate block">
                          {thsrDestStationName || '選擇訖站'}
                        </span>
                      </div>
                    </button>
                  </div>

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
                    className="w-full bg-[#ff6b00] hover:bg-[#e55f00] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-press shadow-lg shadow-orange-500/20"
                    onClick={handleThsrSearch}
                    disabled={!thsrOriginStation || !thsrDestinationStation || thsrTrainsLoading || !hasCredentials()}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{thsrTrainsLoading ? '查詢中...' : '查詢班次'}</span>
                  </button>

                  {!hasCredentials() && (
                    <div className="text-center text-sm text-gray-400">
                      請先
                      <button
                        type="button"
                        className="text-[#ff6b00] hover:underline mx-1"
                        onClick={() => setShowSettings(true)}
                      >
                        設定 API 認證
                      </button>
                      才能查詢班次
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 查詢結果 - 台鐵 */}
        {mode === 'tra' && (
          <>
            {traTrains.length === 0 && !traTrainsLoading && !traTrainsError && (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <p className="text-gray-400">準備出發？選擇起訖站後點擊查詢</p>
              </div>
            )}
            <TrainList
              trains={filteredTraTrains}
              loading={traTrainsLoading}
              error={traTrainsError}
              trainDate={trainDate}
            />
          </>
        )}

        {/* 查詢結果 - 高鐵 */}
        {mode === 'thsr' && (
          <>
            {thsrTrains.length === 0 && !thsrTrainsLoading && !thsrTrainsError && (
              <div className="text-center py-16 animate-fade-in">
                <div className="text-gray-300 mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2h3.54l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM6 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S8.33 17 7.5 17 6 16.33 6 15.5zm4-5.5H6V7h4v3zm1 0V7h2v3h-2zm6 5.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM18 10h-4V7h4v3z"/>
                  </svg>
                </div>
                <p className="text-gray-400">準備出發？選擇起訖站後點擊查詢</p>
              </div>
            )}
            <ThsrTrainList
              trains={filteredThsrTrains}
              loading={thsrTrainsLoading}
              error={thsrTrainsError}
              trainDate={trainDate}
            />
          </>
        )}
      </main>

      {/* 台鐵車站選擇器 */}
      {showTraStationPicker && (
        <StationPicker
          stations={traStations}
          originStation={traOriginStation}
          destinationStation={traDestinationStation}
          onSelect={handleTraStationSelect}
          onClose={() => setShowTraStationPicker(false)}
        />
      )}

      {/* 高鐵車站選擇器 */}
      {showThsrStationPicker && (
        <ThsrStationPicker
          stations={thsrStations}
          originStation={thsrOriginStation}
          destinationStation={thsrDestinationStation}
          onSelect={handleThsrStationSelect}
          onClose={() => setShowThsrStationPicker(false)}
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
          className="fixed right-6 w-12 h-12 bg-white rounded-full shadow-lg shadow-gray-300/50 border border-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          style={{
            bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
            color: themeColor
          }}
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
