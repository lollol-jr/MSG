'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSizeMB = 10
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndUpload(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndUpload(files);
    }
  };

  const validateAndUpload = (files: File[]) => {
    setError('');

    // 파일 개수 확인
    if (files.length > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드 가능합니다`);
      return;
    }

    // 파일 크기 확인
    const maxSize = maxSizeMB * 1024 * 1024;
    const oversized = files.find(f => f.size > maxSize);
    if (oversized) {
      setError(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다`);
      return;
    }

    onUpload(files);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-upload"
          accept="image/*,.pdf,.txt,.csv,.json"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📎</div>
          <p className="text-sm text-gray-600">
            파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-gray-400 mt-1">
            최대 {maxFiles}개, 파일당 {maxSizeMB}MB
          </p>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
