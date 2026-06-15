import { useState } from 'react';
import { Plus, Trash2, Copy, Check, Terminal } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Header {
  id: string;
  key: string;
  value: string;
}

function generateMacCurl(method: HttpMethod, url: string, headers: Header[], body: string): string {
  if (!url) return '';
  const parts = [`curl -X ${method}`];
  for (const h of headers) {
    if (h.key) parts.push(`  -H '${h.key}: ${h.value}'`);
  }
  if (body && method !== 'GET' && method !== 'DELETE') {
    parts.push(`  -d '${body}'`);
  }
  parts.push(`  '${url}'`);
  return parts.join(' \\\n');
}

function generateWinCmdCurl(method: HttpMethod, url: string, headers: Header[], body: string): string {
  if (!url) return '';
  const parts = [`curl -X ${method}`];
  for (const h of headers) {
    if (h.key) parts.push(`  -H "${h.key}: ${h.value}"`);
  }
  if (body && method !== 'GET' && method !== 'DELETE') {
    const escaped = body.replace(/"/g, '\\"');
    parts.push(`  -d "${escaped}"`);
  }
  parts.push(`  "${url}"`);
  return parts.join(' ^\n');
}

function generatePowerShellCurl(method: HttpMethod, url: string, headers: Header[], body: string): string {
  if (!url) return '';
  const parts = [`curl.exe -X ${method}`];
  for (const h of headers) {
    if (h.key) parts.push(`  -H '${h.key}: ${h.value}'`);
  }
  if (body && method !== 'GET' && method !== 'DELETE') {
    const escaped = body.replace(/'/g, "''");
    parts.push(`  -d '${escaped}'`);
  }
  parts.push(`  '${url}'`);
  return parts.join(' `\n');
}

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const { copied, copy } = useClipboard();
  return (
    <button
      onClick={() => copy(text)}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700
        text-white disabled:text-gray-400 dark:disabled:text-gray-500"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'コピー完了' : 'コピー'}
    </button>
  );
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  POST:   'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PUT:    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  PATCH:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function CurlBuilder() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([{ id: '1', key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [bodyError, setBodyError] = useState('');

  const addHeader = () =>
    setHeaders(prev => [...prev, { id: Date.now().toString(), key: '', value: '' }]);

  const removeHeader = (id: string) =>
    setHeaders(prev => prev.filter(h => h.id !== id));

  const updateHeader = (id: string, field: 'key' | 'value', value: string) =>
    setHeaders(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));

  const handleBodyChange = (value: string) => {
    setBody(value);
    if (!value) { setBodyError(''); return; }
    try { JSON.parse(value); setBodyError(''); }
    catch { setBodyError('JSONの形式が正しくありません'); }
  };

  const formatBody = () => {
    try {
      setBody(JSON.stringify(JSON.parse(body), null, 2));
      setBodyError('');
    } catch { /* already showing error */ }
  };

  const macCmd = generateMacCurl(method, url, headers, body);
  const winCmd = generateWinCmdCurl(method, url, headers, body);
  const psCmd = generatePowerShellCurl(method, url, headers, body);

  const showBody = method !== 'GET' && method !== 'DELETE';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">curl コマンドビルダー</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          REST APIのリクエスト情報を入力すると、Mac / Windows用のcurlコマンドを自動生成します
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">

        {/* メソッド + URL */}
        <div className="flex gap-3">
          <div className="flex-none">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">メソッド</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border
                    ${method === m
                      ? `${METHOD_COLORS[m]} border-transparent ring-2 ring-offset-1 ring-blue-500`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/users"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">ヘッダー</label>
            <button
              onClick={addHeader}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Plus size={13} /> 追加
            </button>
          </div>
          <div className="space-y-2">
            {headers.map(h => (
              <div key={h.id} className="flex gap-2">
                <input
                  type="text"
                  value={h.key}
                  onChange={e => updateHeader(h.id, 'key', e.target.value)}
                  placeholder="Header名"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={h.value}
                  onChange={e => updateHeader(h.id, 'value', e.target.value)}
                  placeholder="値"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeHeader(h.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ボディ */}
        {showBody && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">ボディ (JSON)</label>
              <button
                onClick={formatBody}
                disabled={!body || !!bodyError}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                整形
              </button>
            </div>
            <textarea
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
              rows={6}
              className={`w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y
                ${bodyError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
            />
            {bodyError && <p className="mt-1 text-xs text-red-500">{bodyError}</p>}
          </div>
        )}
      </div>

      {/* 生成結果 */}
      {url && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Terminal size={16} /> 生成されたコマンド
          </h3>

          {/* Mac */}
          <CommandBlock label="Mac (ターミナル)" command={macCmd} />

          {/* Windows コマンドプロンプト */}
          <CommandBlock label="Windows (コマンドプロンプト)" command={winCmd} />

          {/* PowerShell */}
          <CommandBlock label="Windows (PowerShell)" command={psCmd} />
        </div>
      )}

      {!url && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <Terminal size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">URLを入力するとコマンドが生成されます</p>
        </div>
      )}
    </div>
  );
}

interface CommandBlockProps {
  label: string;
  command: string;
}

function CommandBlock({ label, command }: CommandBlockProps) {
  return (
    <div className="bg-gray-900 dark:bg-black rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <CopyButton text={command} />
      </div>
      <pre className="px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre">{command}</pre>
    </div>
  );
}
