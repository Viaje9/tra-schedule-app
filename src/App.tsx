import { useState, useMemo } from 'react';
import { DatePicker } from './components/DatePicker';
import { TrainList } from './components/TrainList';
import { TrainDetail } from './components/TrainDetail';
import { SettingsModal } from './components/SettingsModal';
import { StationPicker } from './components/StationPicker';
import { useStations, useODQuery, useTrainDetail } from './hooks/useTrainQuery';
import { getTodayDate, isDemoMode } from './api/tdx';

function App() {
  const [originStation, setOriginStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [trainDate, setTrainDate] = useState(getTodayDate());
  const [showSettings, setShowSettings] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [, forceUpdate] = useState({});

  const { stations, loading: stationsLoading, error: stationsError } = useStations();
  const { trains, loading: trainsLoading, error: trainsError, query: queryTrains } = useODQuery();
  const {
    timetable,
    loading: detailLoading,
    error: detailError,
    query: queryDetail,
    reset: resetDetail,
  } = useTrainDetail();

  const originStationName = useMemo(
    () => stations.find((s) => s.StationID === originStation)?.StationName.Zh_tw,
    [stations, originStation]
  );

  const destStationName = useMemo(
    () => stations.find((s) => s.StationID === destinationStation)?.StationName.Zh_tw,
    [stations, destinationStation]
  );

  const handleSearch = () => {
    if (originStation && destinationStation) {
      queryTrains(originStation, destinationStation, trainDate, originStationName, destStationName);
    }
  };

  const handleSwapStations = () => {
    setOriginStation(destinationStation);
    setDestinationStation(originStation);
  };

  const handleTrainClick = (trainNo: string, date: string) => {
    queryDetail(trainNo, date);
  };

  const handleStationSelect = (origin: string, destination: string) => {
    setOriginStation(origin);
    setDestinationStation(destination);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-500 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">台鐵班次查詢</h1>
            <p className="text-teal-100 text-xs mt-0.5">TRA Train Schedule</p>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-teal-400 rounded-lg transition-colors"
            onClick={() => setShowSettings(true)}
            title="API 設定"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Demo 模式提示 */}
        {isDemoMode() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-amber-800 text-sm">
              <span className="font-medium">Demo 模式：</span>
              目前使用模擬資料。
              <button
                type="button"
                className="text-amber-600 underline hover:text-amber-800 ml-1"
                onClick={() => setShowSettings(true)}
              >
                設定 API
              </button>
            </p>
          </div>
        )}

        {/* 查詢表單 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          {stationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-gray-600">載入車站資料...</span>
            </div>
          ) : stationsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {stationsError}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 起訖站選擇 */}
              <div className="flex items-center gap-2">
                {/* 起站 */}
                <button
                  type="button"
                  onClick={() => setShowStationPicker(true)}
                  className="flex-1 text-left"
                >
                  <div className="text-xs text-teal-600 mb-1">出發</div>
                  <div className={`w-full py-3 px-4 rounded-lg border-2 text-lg font-medium ${
                    originStation ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}>
                    {originStationName || '選擇起站'}
                  </div>
                </button>

                {/* 交換按鈕 */}
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="p-2 text-teal-500 hover:bg-teal-50 rounded-full mt-5"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>

                {/* 訖站 */}
                <button
                  type="button"
                  onClick={() => setShowStationPicker(true)}
                  className="flex-1 text-left"
                >
                  <div className="text-xs text-teal-600 mb-1 text-right">抵達</div>
                  <div className={`w-full py-3 px-4 rounded-lg border-2 text-lg font-medium ${
                    destinationStation ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}>
                    {destStationName || '選擇訖站'}
                  </div>
                </button>
              </div>

              {/* 日期選擇 */}
              <DatePicker value={trainDate} onChange={setTrainDate} />

              {/* 查詢按鈕 */}
              <button
                type="button"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleSearch}
                disabled={!originStation || !destinationStation || trainsLoading}
              >
                {trainsLoading ? '查詢中...' : '查詢班次'}
              </button>
            </div>
          )}
        </div>

        {/* 查詢結果 */}
        <TrainList
          trains={trains}
          loading={trainsLoading}
          error={trainsError}
          onTrainClick={handleTrainClick}
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

      {/* 車次詳情 Modal */}
      <TrainDetail
        timetable={timetable}
        loading={detailLoading}
        error={detailError}
        onClose={resetDetail}
      />

      {/* 設定 Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => forceUpdate({})}
      />

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-xs">
        <p>資料來源：TDX 運輸資料流通服務平台</p>
      </footer>
    </div>
  );
}

export default App;
