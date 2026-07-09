import { StreamLanguage, StringStream } from '@codemirror/language';

const KEYWORDS = new Set([
  'flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'erDiagram',
  'stateDiagram-v2', 'stateDiagram', 'gantt', 'pie', 'participant', 'actor',
  'activate', 'deactivate', 'loop', 'alt', 'else', 'opt', 'par', 'and', 'end',
  'note', 'title', 'section', 'dateFormat', 'class', 'state', 'subgraph',
  'TD', 'TB', 'BT', 'RL', 'LR', 'showData', 'done', 'active', 'crit',
]);

const ARROW_RE = /^(<\|--|--\|>|\.\.\|>|<\|\.\.|--\*|\*--|--o|o--|-->|<--|-\.->|-\.-|==>|--x|x--|--\)|\(--|->>|-->>|-x|--)/;

function tokenizer(stream: StringStream) {
  if (stream.match('%%')) {
    stream.skipToEnd();
    return 'comment';
  }
  if (stream.match(ARROW_RE)) {
    return 'operator';
  }
  if (stream.match(/^"[^"]*"/) || stream.match(/^'[^']*'/)) {
    return 'string';
  }
  if (stream.match(/^\d+(\.\d+)?/)) {
    return 'number';
  }
  if (stream.match(/^[A-Za-z_][\w-]*/)) {
    const word = stream.current();
    if (KEYWORDS.has(word)) return 'keyword';
    return 'variableName';
  }
  if (stream.match(/^[[\](){}|:,;]/)) {
    return 'punctuation';
  }
  stream.next();
  return null;
}

export const mermaidLanguage = StreamLanguage.define({
  name: 'mermaid',
  startState: () => ({}),
  token: tokenizer,
});
