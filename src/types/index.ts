export type OS = 'windows' | 'mac';

export type Tool = 'vscode' | 'obsidian' | 'notion';

export type CommandCategory = 'basic' | 'git';

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

export interface Command {
  id: string;
  category: CommandCategory;
  name: string;
  description: string;
  windowsCommand: string;
  macCommand: string;
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

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  basic: '基本',
  git: 'Git',
};
