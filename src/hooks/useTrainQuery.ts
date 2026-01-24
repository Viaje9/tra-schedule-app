import { useState, useEffect, useCallback } from 'react';
import type { Station, DailyTrainTimetable, TrainTimetable } from '../types/train';
import { fetchStations, fetchODTimetable, fetchTrainTimetable, fetchStationLiveBoard, fetchTrainLiveBoard, mergeDelayInfo, getTodayDate } from '../api/tdx';

// 車站資料 Hook
export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const data = await fetchStations();
        setStations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入車站資料失敗');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  return { stations, loading, error };
}

// 站對站查詢 Hook（含即時延誤資訊）
export function useODQuery() {
  const [trains, setTrains] = useState<DailyTrainTimetable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (
    originStationId: string,
    destinationStationId: string,
    trainDate: string = getTodayDate()
  ) => {
    try {
      setLoading(true);
      setError(null);

      // 同時請求時刻表和即時資料（StationLiveBoard + TrainLiveBoard）
      const [timetableData, stationLiveBoardData, trainLiveBoardData] = await Promise.all([
        fetchODTimetable(originStationId, destinationStationId, trainDate),
        fetchStationLiveBoard(originStationId),
        fetchTrainLiveBoard(),
      ]);

      // 合併延誤資訊（即時資料失敗不影響時刻表顯示）
      // StationLiveBoard 優先，TrainLiveBoard 作為補充
      const mergedData = mergeDelayInfo(timetableData, stationLiveBoardData, trainLiveBoardData);
      setTrains(mergedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查詢班次失敗');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTrains([]);
    setError(null);
  }, []);

  return { trains, loading, error, query, reset };
}

// 車次詳情 Hook
export function useTrainDetail() {
  const [timetable, setTimetable] = useState<TrainTimetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (trainNo: string, trainDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrainTimetable(trainNo, trainDate);
      if (data.length > 0) {
        setTimetable(data[0]);
      } else {
        setError('找不到車次資料');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '查詢車次詳情失敗');
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTimetable(null);
    setError(null);
  }, []);

  return { timetable, loading, error, query, reset };
}
