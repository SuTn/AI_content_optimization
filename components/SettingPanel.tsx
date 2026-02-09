'use client';

import { X } from 'lucide-react';
import { Settings, FONT_SIZE_OPTIONS, LINE_HEIGHT_OPTIONS, COLOR_PRESETS } from '@/types';

interface SettingPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingPanel({ settings, onChange, onClose }: SettingPanelProps) {
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-80 bg-white h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">样式设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Font Size */}
          <section>
            <h3 className="text-sm font-medium text-gray-700 mb-3">字体大小</h3>
            <div className="grid grid-cols-4 gap-2">
              {FONT_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`py-2 text-sm rounded border transition-colors ${
                    settings.fontSize === size
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          {/* Line Height */}
          <section>
            <h3 className="text-sm font-medium text-gray-700 mb-3">行距</h3>
            <div className="grid grid-cols-5 gap-2">
              {LINE_HEIGHT_OPTIONS.map((height) => (
                <button
                  key={height}
                  onClick={() => updateSetting('lineHeight', height)}
                  className={`py-2 text-sm rounded border transition-colors ${
                    settings.lineHeight === height
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {height}
                </button>
              ))}
            </div>
          </section>

          {/* Primary Color */}
          <section>
            <h3 className="text-sm font-medium text-gray-700 mb-3">主色调</h3>
            <div className="space-y-3">
              {/* Color presets */}
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => updateSetting('primaryColor', preset.value)}
                    className={`py-2 px-1 text-xs rounded border transition-all ${
                      settings.primaryColor === preset.value
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => {
                    const hex = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                      updateSetting('primaryColor', hex);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#576b95"
                />
              </div>
            </div>
          </section>

          {/* Preview */}
          <section className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">预览</h3>
            <div
              className="p-4 rounded border border-gray-200"
              style={{ fontSize: `${settings.fontSize}px`, lineHeight: String(settings.lineHeight) }}
            >
              <p className="mb-2">
                这是一段<span style={{ color: settings.primaryColor, fontWeight: 'bold' }}>示例文字</span>，展示当前设置的效果。
              </p>
              <a
                href="#"
                className="hover:underline"
                style={{ color: settings.primaryColor }}
                onClick={(e) => e.preventDefault()}
              >
                这是一个链接样式
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
