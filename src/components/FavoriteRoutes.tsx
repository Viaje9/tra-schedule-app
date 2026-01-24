import { useState } from 'react';
import type { FavoriteRoute } from '../hooks/useFavoriteRoutes';

interface FavoriteRoutesProps {
  routes: FavoriteRoute[];
  canAddMore: boolean;
  maxRoutes: number;
  canSave: boolean;
  alreadyExists: boolean;
  onSelectRoute: (originId: string, destinationId: string) => void;
  onSaveRoute: () => void;
  onRemoveRoute: (id: string) => void;
}

export function FavoriteRoutes({
  routes,
  canAddMore,
  maxRoutes,
  canSave,
  alreadyExists,
  onSelectRoute,
  onSaveRoute,
  onRemoveRoute,
}: FavoriteRoutesProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRouteClick = (route: FavoriteRoute) => {
    if (isEditMode) return;
    onSelectRoute(route.originId, route.destinationId);
  };

  const getSaveButtonText = () => {
    if (!canAddMore) return `已達上限 (${maxRoutes}/${maxRoutes})`;
    if (alreadyExists) return '路線已存在';
    return '儲存路線';
  };

  const isSaveDisabled = !canSave || !canAddMore || alreadyExists;

  return (
    <div className="py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="text-sm font-medium">常用路線</span>
        </div>
        {routes.length > 0 && (
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`text-sm font-medium transition-colors ${
              isEditMode ? 'text-[#3b6bdf]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isEditMode ? '完成' : '編輯'}
          </button>
        )}
      </div>

      {/* Routes List */}
      <div className="flex items-center flex-wrap gap-2">
        {routes.length === 0 ? (
          <span className="text-sm text-gray-400">尚無常用路線</span>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="relative">
              <button
                type="button"
                onClick={() => handleRouteClick(route)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isEditMode
                    ? 'bg-red-50 text-red-600 pr-7'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {route.originName} → {route.destName}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onRemoveRoute(route.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}

        {/* Save Button */}
        {!isEditMode && (
          <button
            type="button"
            onClick={onSaveRoute}
            disabled={isSaveDisabled}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              isSaveDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#3b6bdf] text-white hover:bg-[#2c5bd4]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{getSaveButtonText()}</span>
          </button>
        )}
      </div>
    </div>
  );
}
