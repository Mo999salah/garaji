import { Pressable, ScrollView, Text } from 'react-native';

import { productCategories } from '@/features/products/data/mockProducts';

interface CategoryFilterProps {
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryFilter({ selectedCategoryId, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 py-1"
      accessibilityRole="tablist"
    >
      {productCategories.map((category) => {
        const isSelected = selectedCategoryId === category.id;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`min-h-11 justify-center rounded-lg border px-4 ${
              isSelected ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'
            }`}
            key={category.id}
            onPress={() => onSelect(category.id)}
          >
            <Text className={`text-sm font-semibold ${isSelected ? 'text-brand-700' : 'text-ink'}`}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
