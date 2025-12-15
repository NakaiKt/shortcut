import { CommandCategory, CATEGORY_LABELS } from '@/types';
import { Button } from './ui/button';

interface CategoryFilterProps {
  selectedCategories: CommandCategory[];
  onChange: (categories: CommandCategory[]) => void;
}

export function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const toggleCategory = (category: CommandCategory) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">カテゴリー:</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as CommandCategory[]).map((category) => (
          <Button
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleCategory(category)}
            className="h-8"
          >
            {CATEGORY_LABELS[category]}
          </Button>
        ))}
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8"
          >
            すべてクリア
          </Button>
        )}
      </div>
    </div>
  );
}
