import { SiObsidian, SiNotion } from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import { Tool } from '@/types';

interface ToolIconProps {
  tool: Tool;
  size?: number;
  className?: string;
  isSelected?: boolean;
}

export function ToolIcon({ tool, size = 16, className = '', isSelected = false }: ToolIconProps) {
  const iconProps = {
    size,
    className: `transition-colors ${className}`,
  };

  // 選択時は白色、非選択時は各ツールの公式カラー
  const getIconColor = () => {
    if (isSelected) {
      return 'text-white';
    }

    switch (tool) {
      case 'vscode':
        return 'text-[#007ACC] dark:text-[#3794FF]';
      case 'obsidian':
        return 'text-[#7C3AED] dark:text-[#A78BFA]';
      case 'notion':
        return 'text-gray-900 dark:text-white';
      default:
        return '';
    }
  };

  const colorClass = `${iconProps.className} ${getIconColor()}`;

  switch (tool) {
    case 'vscode':
      return <VscVscode {...iconProps} className={colorClass} />;
    case 'obsidian':
      return <SiObsidian {...iconProps} className={colorClass} />;
    case 'notion':
      return <SiNotion {...iconProps} className={colorClass} />;
    default:
      return null;
  }
}
