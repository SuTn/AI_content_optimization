'use client';

import { useState } from 'react';
import { X, TestTube, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { AIConfig, AIProvider, PROVIDER_CONFIGS, DEFAULT_AI_CONFIG } from '@/types/ai';

interface AIConfigPanelProps {
  config: AIConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
}

export function AIConfigPanel({ config, isOpen, onClose, onSave }: AIConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleProviderChange = (provider: AIProvider) => {
    const providerConfig = PROVIDER_CONFIGS[provider];
    setLocalConfig({
      ...localConfig,
      provider,
      baseUrl: providerConfig.defaultBaseUrl,
      model: providerConfig.defaultModel,
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: localConfig }),
      });
      const result = await response.json();

      setTestResult({
        success: result.success,
        message: result.success
          ? `连接成功！AI 回复: ${result.reply || '正常'}`
          : result.error || '连接失败',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">AI 优化配置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-auto">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">启用 AI 优化</label>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localConfig.enabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {localConfig.enabled && (
            <>
              {/* Provider selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI 服务商
                </label>
                <select
                  value={localConfig.provider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PROVIDER_CONFIGS).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 地址 (Base URL)
                </label>
                <input
                  type="text"
                  value={localConfig.baseUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Model name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型名称
                </label>
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  placeholder="gpt-4"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={localConfig.apiKey}
                    onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  温度: {localConfig.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={localConfig.temperature}
                  onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Test connection */}
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !localConfig.apiKey}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TestTube size={16} />
                  <span>{testing ? '测试中...' : '测试连接'}</span>
                </button>
              </div>

              {/* Test result */}
              {testResult && (
                <div className={`flex items-center gap-2 p-3 rounded ${
                  testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {testResult.success ? <Check size={18} /> : <XIcon size={18} />}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
