export type OS = 'windows' | 'mac';

export type Tool = 'vscode' | 'obsidian' | 'notion';

export type CommandCategory = 'basic' | 'git' | 'sequelize' | 'docker';

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

export interface CommandOption {
  id: string;
  windows: string;
  mac: string;
  description: string;
}

export interface Command {
  id: string;
  category: CommandCategory;
  name: string;
  description: string;
  windowsCommand: string;
  macCommand: string;
  options?: CommandOption[];
}

export interface TransactionStep {
  commandId?: string; // commandIdがない場合は手動ステップ
  optionIds?: string[];
  note?: string;
}

export interface Transaction {
  id: string;
  category: CommandCategory;
  name: string;
  description: string;
  steps: TransactionStep[];
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
  sequelize: 'Sequelize',
  docker: 'Docker',
};
