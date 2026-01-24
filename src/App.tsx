import { useState, useMemo } from 'react';
import { StationSelect } from './components/StationSelect';
import { DatePicker } from './components/DatePicker';
import { TrainList } from './components/TrainList';
import { TrainDetail } from './components/TrainDetail';
import { SettingsModal } from './components/SettingsModal';
import { useStations, useODQuery, useTrainDetail } from './hooks/useTrainQuery';
import { getTodayDate, isDemoMode } from './api/tdx';

function App() {
  const [originStation, setOriginStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [trainDate, setTrainDate] = useState(getTodayDate());
  const [showSettings, setShowSettings] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">台鐵班次查詢</h1>
            <p className="text-blue-100 text-sm mt-1">TRA Train Schedule</p>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            onClick={() => setShowSettings(true)}
            title="API 設定"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Demo 模式提示 */}
        {isDemoMode() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <span className="font-medium">Demo 模式：</span>
              目前使用模擬資料展示功能。
              <button
                type="button"
                className="text-amber-600 underline hover:text-amber-800 ml-1"
                onClick={() => setShowSettings(true)}
              >
                點此設定 TDX API
              </button>
              {' '}以查詢真實班次。
            </p>
          </div>
        )}

        {/* 查詢表單 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {stationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">載入車站資料...</span>
            </div>
          ) : stationsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {stationsError}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                <StationSelect
                  stations={stations}
                  value={originStation}
                  onChange={setOriginStation}
                  placeholder="輸入車站名稱"
                  label="起站"
                />

                <button
                  type="button"
                  className="px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors self-end mb-0.5"
                  onClick={handleSwapStations}
                  title="交換起訖站"
                >
                  ⇄
                </button>

                <StationSelect
                  stations={stations}
                  value={destinationStation}
                  onChange={setDestinationStation}
                  placeholder="輸入車站名稱"
                  label="訖站"
                />
              </div>

              <DatePicker value={trainDate} onChange={setTrainDate} />

              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>資料來源：TDX 運輸資料流通服務平台</p>
      </footer>
    </div>
  );
}

export default App;
