import { useState, useEffect } from 'react';
import { getCredentials, setCredentials, clearCredentials } from '../api/tdx';

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
    <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b6bdf]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3b6bdf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">TDX API 設定</h2>
          </div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 提示訊息 */}
          <div className="bg-gradient-to-br from-[#3b6bdf]/10 to-[#3b6bdf]/5 rounded-xl p-4 border border-[#3b6bdf]/10">
            <p className="text-gray-600 text-sm leading-relaxed">
              請至{' '}
              <a
                href="https://tdx.transportdata.tw/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3b6bdf] font-medium hover:underline"
              >
                TDX 平台
              </a>
              {' '}註冊帳號並建立應用程式，即可取得 Client ID 和 Client Secret。
            </p>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b6bdf] focus:ring-2 focus:ring-[#3b6bdf]/20 transition-all text-gray-800"
              placeholder="輸入 Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3b6bdf] focus:ring-2 focus:ring-[#3b6bdf]/20 transition-all text-gray-800"
              placeholder="輸入 Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-2">
            {hasExisting && (
              <button
                type="button"
                className="flex-1 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                onClick={handleClear}
              >
                清除設定
              </button>
            )}
            <button
              type="button"
              className="flex-1 bg-[#3b6bdf] hover:bg-[#2c5bd4] text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
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
