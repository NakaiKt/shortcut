import { SiVscodium, SiObsidian, SiNotion } from 'react-icons/si';
import { Tool } from '@/types';

interface ToolIconProps {
  tool: Tool;
  size?: number;
  className?: string;
}

export function ToolIcon({ tool, size = 16, className = '' }: ToolIconProps) {
  const iconProps = {
    size,
    className: `transition-colors ${className}`,
  };

  switch (tool) {
    case 'vscode':
      return <SiVscodium {...iconProps} className={`${iconProps.className} text-[#007ACC] dark:text-[#3794FF]`} />;
    case 'obsidian':
      return <SiObsidian {...iconProps} className={`${iconProps.className} text-[#7C3AED] dark:text-[#A78BFA]`} />;
    case 'notion':
      return <SiNotion {...iconProps} className={`${iconProps.className} text-gray-900 dark:text-white`} />;
    default:
      return null;
  }
}
