import { useState } from 'react';
import { Plus, Trash2, Copy, Check, Terminal } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type OsTarget = 'mac' | 'linux' | 'windows-cmd' | 'windows-ps';

interface KVPair {
  id: string;
  key: string;
  value: string;
}

const OS_OPTIONS: { id: OsTarget; label: string }[] = [
  { id: 'mac', label: 'Mac' },
  { id: 'linux', label: 'Linux' },
  { id: 'windows-cmd', label: 'Windows (cmd)' },
  { id: 'windows-ps', label: 'Windows (PowerShell)' },
];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300',
  POST:   'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  PUT:    'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  PATCH:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
};

function buildUrl(base: string, queries: KVPair[]): string {
  const active = queries.filter(q => q.key);
  if (!active.length) return base;
  const qs = active.map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`).join('&');
  return `${base}${base.includes('?') ? '&' : '?'}${qs}`;
}

function generateCommand(
  os: OsTarget,
  method: HttpMethod,
  baseUrl: string,
  queries: KVPair[],
  headers: KVPair[],
  body: string,
): string {
  if (!baseUrl) return '';
  const fullUrl = buildUrl(baseUrl, queries);

  if (os === 'windows-cmd') {
    const parts = [`curl -X ${method}`];
    for (const h of headers) {
      if (h.key) parts.push(`  -H "${h.key}: ${h.value}"`);
    }
    if (body) {
      const escaped = body.replace(/"/g, '\\"');
      parts.push(`  -d "${escaped}"`);
    }
    parts.push(`  "${fullUrl}"`);
    return parts.join(' ^\n');
  }

  if (os === 'windows-ps') {
    const parts = [`curl.exe -X ${method}`];
    for (const h of headers) {
      if (h.key) parts.push(`  -H '${h.key}: ${h.value}'`);
    }
    if (body) {
      const escaped = body.replace(/'/g, "''");
      parts.push(`  -d '${escaped}'`);
    }
    parts.push(`  '${fullUrl}'`);
    return parts.join(' `\n');
  }

  // mac / linux
  const parts = [`curl -X ${method}`];
  for (const h of headers) {
    if (h.key) parts.push(`  -H '${h.key}: ${h.value}'`);
  }
  if (body) {
    parts.push(`  -d '${body}'`);
  }
  parts.push(`  '${fullUrl}'`);
  return parts.join(' \\\n');
}

function newPair(): KVPair {
  return { id: Date.now().toString() + Math.random(), key: '', value: '' };
}

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useClipboard();
  return (
    <button
      onClick={() => copy(text)}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
        bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
        text-white disabled:text-gray-400"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'コピー完了' : 'コピー'}
    </button>
  );
}

function KVEditor({
  label,
  pairs,
  onAdd,
  onRemove,
  onChange,
  keyPlaceholder,
  valuePlaceholder,
}: {
  label: string;
  pairs: KVPair[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: 'key' | 'value', val: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Plus size={13} /> 追加
        </button>
      </div>
      <div className="space-y-2">
        {pairs.map(p => (
          <div key={p.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={p.key}
              onChange={e => onChange(p.id, 'key', e.target.value)}
              placeholder={keyPlaceholder ?? 'キー'}
              className="min-w-0 flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={p.value}
              onChange={e => onChange(p.id, 'value', e.target.value)}
              placeholder={valuePlaceholder ?? '値'}
              className="min-w-0 flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onRemove(p.id)}
              className="flex-none p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CurlBuilder() {
  const [os, setOs] = useState<OsTarget>('mac');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [queries, setQueries] = useState<KVPair[]>([newPair()]);
  const [headers, setHeaders] = useState<KVPair[]>([{ id: '1', key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [bodyError, setBodyError] = useState('');

  const handleBodyChange = (v: string) => {
    setBody(v);
    if (!v) { setBodyError(''); return; }
    try { JSON.parse(v); setBodyError(''); }
    catch { setBodyError('JSONの形式が正しくありません'); }
  };

  const formatBody = () => {
    try { setBody(JSON.stringify(JSON.parse(body), null, 2)); setBodyError(''); } catch { /* noop */ }
  };

  const addPair = (setter: React.Dispatch<React.SetStateAction<KVPair[]>>) =>
    setter(prev => [...prev, newPair()]);

  const removePair = (setter: React.Dispatch<React.SetStateAction<KVPair[]>>, id: string) =>
    setter(prev => prev.filter(p => p.id !== id));

  const updatePair = (setter: React.Dispatch<React.SetStateAction<KVPair[]>>, id: string, field: 'key' | 'value', val: string) =>
    setter(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const command = generateCommand(os, method, url, queries, headers, body);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">curl コマンドビルダー</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          リクエスト情報を入力すると、OS別のcurlコマンドを自動生成します
        </p>
      </div>

      {/* OS選択 */}
      <div className="flex flex-wrap gap-2">
        {OS_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setOs(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
              ${os === opt.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 入力フォーム */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-5">

        {/* メソッド */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">メソッド</label>
          <div className="flex flex-wrap gap-1.5">
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

        {/* URL */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/users"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* クエリパラメータ */}
        <KVEditor
          label="クエリパラメータ"
          pairs={queries}
          onAdd={() => addPair(setQueries)}
          onRemove={id => removePair(setQueries, id)}
          onChange={(id, field, val) => updatePair(setQueries, id, field, val)}
          keyPlaceholder="キー"
          valuePlaceholder="値"
        />

        {/* ヘッダー */}
        <KVEditor
          label="ヘッダー"
          pairs={headers}
          onAdd={() => addPair(setHeaders)}
          onRemove={id => removePair(setHeaders, id)}
          onChange={(id, field, val) => updatePair(setHeaders, id, field, val)}
          keyPlaceholder="Header名"
          valuePlaceholder="値"
        />

        {/* ボディ */}
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
            rows={5}
            className={`w-full px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y
              ${bodyError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
          />
          {bodyError && <p className="mt-1 text-xs text-red-500">{bodyError}</p>}
        </div>
      </div>

      {/* 生成結果 */}
      {url ? (
        <div className="bg-gray-900 dark:bg-black rounded-xl overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-2">
              <Terminal size={14} />
              {OS_OPTIONS.find(o => o.id === os)?.label}
            </span>
            <CopyButton text={command} />
          </div>
          <pre className="px-4 py-3 text-sm text-green-400 font-mono overflow-x-auto whitespace-pre">{command}</pre>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <Terminal size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">URLを入力するとコマンドが生成されます</p>
        </div>
      )}
    </div>
  );
}
