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

  // 選択時はモードを反転、非選択時は通常のモードに従う
  const getIconColor = () => {
    switch (tool) {
      case 'vscode':
        return isSelected
          ? 'text-[#3794FF] dark:text-[#007ACC]'
          : 'text-[#007ACC] dark:text-[#3794FF]';
      case 'obsidian':
        return isSelected
          ? 'text-[#A78BFA] dark:text-[#7C3AED]'
          : 'text-[#7C3AED] dark:text-[#A78BFA]';
      case 'notion':
        return isSelected
          ? 'text-white dark:text-gray-900'
          : 'text-gray-900 dark:text-white';
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
