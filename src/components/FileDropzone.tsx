import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, File as FileIcon, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  onFilesSelect: (files: File[]) => void;
  /** 受け付ける形式。MIMEタイプ（'image/*', 'video/mp4'）または拡張子（'.mov'）。未指定なら全ファイル */
  accept?: string[];
  multiple?: boolean;
  description?: string;
  buttonLabel?: string;
  icon?: LucideIcon;
}

// input の accept 属性はダイアログの絞り込みにしか効かないため、D&D・貼り付けは自前で判定する
function matchesAccept(file: File, accept: string[] | undefined): boolean {
  if (!accept || accept.length === 0) return true;
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return accept.some((pattern) => {
    const p = pattern.trim().toLowerCase();
    if (p.startsWith('.')) return fileName.endsWith(p);
    if (p.endsWith('/*')) return fileType.startsWith(p.slice(0, -1));
    return fileType === p;
  });
}

export function FileDropzone({
  onFilesSelect,
  accept,
  multiple = false,
  description = 'ファイルをドラッグ&ドロップ、クリップボードから貼り付け（Ctrl+V）、または選択してください',
  buttonLabel = 'ファイルを選択',
  icon: Icon = FileIcon,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // 呼び出し側がインライン関数を渡しても paste リスナーを毎レンダー張り直さないよう ref で保持する
  const onFilesSelectRef = useRef(onFilesSelect);
  onFilesSelectRef.current = onFilesSelect;
  const acceptKey = accept?.join(',');

  const emitFiles = useCallback((files: File[]) => {
    const acceptList = acceptKey ? acceptKey.split(',') : undefined;
    const accepted = files.filter((file) => matchesAccept(file, acceptList));
    if (accepted.length === 0) return;
    onFilesSelectRef.current(multiple ? accepted : accepted.slice(0, 1));
  }, [acceptKey, multiple]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind !== 'file') continue;
        const file = item.getAsFile();
        if (file) files.push(file);
      }
      emitFiles(files);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [emitFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FileListはliveオブジェクトなのでinputリセット前にコピーする
    const files = Array.from(e.target.files ?? []);
    // inputをリセットして同じファイルを再選択できるようにする
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    emitFiles(files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    emitFiles(Array.from(e.dataTransfer.files));
  }, [emitFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptKey}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <Icon className="mx-auto mb-3 text-gray-400 dark:text-gray-500" size={48} />
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <Button onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2" size={18} />
        {buttonLabel}
      </Button>
    </div>
  );
}
