'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string, files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, disabled, placeholder = "메시지를 입력하세요..." }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input, files);
    setInput('');
    setFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="border-t p-4">
      {/* 선택된 파일 표시 */}
      {files.length > 0 && (
        <div className="mb-2 flex gap-2 flex-wrap">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
            >
              <span>{file.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* 파일 업로드 버튼 */}
        <label className="cursor-pointer flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.txt,.csv,.json"
          />
          <span className="text-xl">📎</span>
        </label>

        {/* 입력창 */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />

        {/* 전송 버튼 */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          전송
        </button>
      </form>
    </div>
  );
}
