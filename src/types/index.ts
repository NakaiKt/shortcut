export type OS = 'windows' | 'mac';

export type Tool = 'vscode' | 'obsidian' | 'notion';

export interface Shortcut {
  id: string;
  tool: Tool;
  name: string;
  description: string;
  windowsKey?: string;
  macKey?: string;
  command?: string;
  isCommand: boolean;
}

export const TOOL_LABELS: Record<Tool, string> = {
  vscode: 'VSCode',
  obsidian: 'Obsidian',
  notion: 'Notion',
};

export const OS_LABELS: Record<OS, string> = {
  windows: 'Windows',
  mac: 'Mac',
};
