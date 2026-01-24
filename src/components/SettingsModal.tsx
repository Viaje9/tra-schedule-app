import { useState, useEffect } from 'react';
import { getCredentials, setCredentials, clearCredentials, hasCredentials } from '../api/tdx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getCredentials();
      if (creds) {
        setClientId(creds.clientId);
        setClientSecret(creds.clientSecret);
        setHasExisting(true);
      } else {
        setClientId('');
        setClientSecret('');
        setHasExisting(false);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (clientId.trim() && clientSecret.trim()) {
      setCredentials(clientId.trim(), clientSecret.trim());
      onSave();
      onClose();
    }
  };

  const handleClear = () => {
    clearCredentials();
    setClientId('');
    setClientSecret('');
    setHasExisting(false);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">TDX API 設定</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              請至{' '}
              <a
                href="https://tdx.transportdata.tw/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                TDX 平台
              </a>
              {' '}註冊帳號並建立應用程式，即可取得 Client ID 和 Client Secret。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="輸入 Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Secret
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="輸入 Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            {hasExisting && (
              <button
                type="button"
                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                onClick={handleClear}
              >
                清除設定
              </button>
            )}
            <button
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              onClick={handleSave}
              disabled={!clientId.trim() || !clientSecret.trim()}
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
