import { useState, useEffect } from 'react';
import { logger, perfMonitor } from '../../lib/logger';
import { Bug, X, Trash2, Download, RefreshCw } from 'lucide-react';

/**
 * Developer Tools Component
 * Only visible in development mode
 * Provides real-time error monitoring and debugging
 */
export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'errors' | 'logs' | 'performance'>('errors');

  useEffect(() => {
    loadErrors();
    loadLogs();

    // Refresh every 2 seconds
    const interval = setInterval(() => {
      loadErrors();
      loadLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadErrors = () => {
    const storedErrors = logger.getStoredErrors();
    setErrors(storedErrors);
  };

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
  };

  const clearErrors = () => {
    logger.clearStoredErrors();
    loadErrors();
  };

  const exportLogs = () => {
    const data = logger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khazaana-logs-${Date.now()}.json`;
    a.click();
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all"
        title="Developer Tools"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bug className="w-6 h-6" />}
        {errors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {errors.length}
          </span>
        )}
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9998] w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border-2 border-purple-600 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">🛠️ Dev Tools</h3>
              <div className="flex space-x-2">
                <button
                  onClick={loadErrors}
                  className="p-1 hover:bg-purple-700 rounded"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={exportLogs}
                  className="p-1 hover:bg-purple-700 rounded"
                  title="Export Logs"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearErrors}
                  className="p-1 hover:bg-purple-700 rounded"
                  title="Clear Errors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                Errors ({errors.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                Logs ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'performance'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                Performance
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {activeTab === 'errors' && (
              <div className="space-y-3">
                {errors.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    ✅ No errors! Everything is working fine.
                  </div>
                ) : (
                  errors.map((error, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        error.critical
                          ? 'bg-red-50 border-red-500'
                          : 'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm">
                          {error.critical ? '🔥' : '⚠️'} {error.context || 'Error'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{error.message}</p>
                      {error.error && (
                        <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                          {error.error.stack || error.error.message}
                        </pre>
                      )}
                      {error.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            View Data
                          </summary>
                          <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(error.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No logs yet.</div>
                ) : (
                  logs.slice().reverse().map((log, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white rounded border border-gray-200 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {log.level} {log.context && `[${log.context}]`}
                        </span>
                        <span className="text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{log.message}</p>
                      {log.data && (
                        <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2">Page Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Load Time:</span>
                      <span className="font-mono">
                        {performance.timing.loadEventEnd - performance.timing.navigationStart}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>DOM Ready:</span>
                      <span className="font-mono">
                        {performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart}ms
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2">Memory Usage</h4>
                  {(performance as any).memory ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span className="font-mono">
                          {((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-mono">
                          {((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Memory info not available</p>
                  )}
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2">Storage</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cart Items:</span>
                      <span className="font-mono">
                        {JSON.parse(localStorage.getItem('khazaana_cart') || '{"items":[]}').items.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order History:</span>
                      <span className="font-mono">
                        {JSON.parse(localStorage.getItem('khazaana_order_history') || '[]').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
