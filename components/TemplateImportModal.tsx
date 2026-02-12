'use client';

import { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface TemplateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

interface ImportPreview {
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export function TemplateImportModal({ isOpen, onClose, onImport }: TemplateImportModalProps) {
  const [inputMethod, setInputMethod] = useState<'paste' | 'file'>('paste');
  const [jsonString, setJsonString] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Parse and validate JSON
  const parseJson = useCallback((value: string) => {
    setError(null);
    setPreview(null);
    setIsValid(false);

    if (!value.trim()) {
      return;
    }

    try {
      const data = JSON.parse(value);

      // Check if it has template data
      const templateData = data.template || (data.templates && data.templates[0]);

      if (!templateData) {
        setError('无效的模板数据：未找到模板内容');
        return;
      }

      // Validate required fields
      if (!templateData.name || typeof templateData.name !== 'string') {
        setError('无效的模板数据：缺少有效的模板名称');
        return;
      }

      if (!templateData.description || typeof templateData.description !== 'string') {
        setError('无效的模板数据：缺少有效的模板描述');
        return;
      }

      // Security check
      const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
      const allStrings = [
        templateData.name,
        templateData.description,
        templateData.icon || '',
        templateData.systemPrompt || '',
        templateData.layoutPrompt || '',
      ];

      for (const str of allStrings) {
        for (const pattern of dangerousPatterns) {
          if (pattern.test(str)) {
            setError('安全警告：检测到潜在的不安全内容');
            return;
          }
        }
      }

      // Set preview
      setPreview({
        name: templateData.name,
        description: templateData.description,
        icon: templateData.icon || '📝',
        features: templateData.features || [],
      });
      setIsValid(true);
    } catch (err) {
      setError('JSON格式错误：请检查输入是否为有效的JSON格式');
    }
  }, []);

  // Handle text input change
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setJsonString(value);
      parseJson(value);
    },
    [parseJson]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonString(content);
        parseJson(content);
      };
      reader.onerror = () => {
        setError('文件读取失败');
      };
      reader.readAsText(file);
    },
    [parseJson]
  );

  // Handle import
  const handleImport = useCallback(() => {
    if (isValid) {
      onImport();
      onClose();
    }
  }, [isValid, onImport, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">导入模板</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Input Method Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMethod('paste')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'paste'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              粘贴JSON
            </button>
            <button
              onClick={() => setInputMethod('file')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              上传文件
            </button>
          </div>

          {/* Paste Input */}
          {inputMethod === 'paste' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                粘贴模板JSON数据
              </label>
              <textarea
                value={jsonString}
                onChange={handleTextChange}
                placeholder='{"version": "1.0", "template": {...}}'
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm resize-none"
              />
            </div>
          )}

          {/* File Upload */}
          {inputMethod === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择JSON文件
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    点击上传或拖拽文件到此处
                  </span>
                  <span className="text-xs text-gray-500 mt-1">支持 .json 文件</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">预览</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{preview.icon}</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">{preview.name}</h5>
                    <p className="text-sm text-gray-600">{preview.description}</p>
                  </div>
                </div>
                {preview.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {preview.features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 text-xs bg-gray-200 rounded"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  模板数据验证通过，可以导入。
                </p>
              </div>
            </div>
          )}

          {/* Helper text */}
          {!preview && !error && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 粘贴或上传之前导出的模板JSON文件。导入后将自动生成新的ID以避免冲突。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            导入模板
          </button>
        </div>
      </div>
    </div>
  );
}
