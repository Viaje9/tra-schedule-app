import { useState, useEffect, useCallback } from 'react';
import type { ThsrStation, ThsrTimetable } from '../types/thsr';
import { fetchThsrStations, fetchThsrODTimetable } from '../api/thsr';
import { getTodayDate } from '../api/tdx';

// 高鐵車站資料 Hook
export function useThsrStations() {
  const [stations, setStations] = useState<ThsrStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const data = await fetchThsrStations();
        // 依照車站 ID 排序（北到南）
        const sorted = data.sort((a, b) => a.StationID.localeCompare(b.StationID));
        setStations(sorted);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入高鐵車站資料失敗');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  return { stations, loading, error };
}

// 高鐵站對站查詢 Hook
export function useThsrODQuery() {
  const [trains, setTrains] = useState<ThsrTimetable[]>([]);
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

      const timetableData = await fetchThsrODTimetable(
        originStationId,
        destinationStationId,
        trainDate
      );

      setTrains(timetableData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查詢高鐵班次失敗');
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
