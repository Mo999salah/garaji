import { ScrollView, Pressable, View } from "react-native";
import { AppText as Text } from "@/shared/components/AppText";

export interface FilterChipOption<T> {
  id: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T> {
  options: FilterChipOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export function FilterChips<T>({
  options,
  activeId,
  onChange,
  className = "",
}: FilterChipsProps<T>) {
  return (
    <View className={className}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-margin-mobile gap-3 flex-row-reverse pb-2"
        className="-mx-margin-mobile px-margin-mobile"
      >
        {options.map((option) => {
          const isActive = activeId === option.id;
          return (
            <Pressable
              key={String(option.id)}
              onPress={() => onChange(option.id)}
              className={`flex-row-reverse items-center justify-center px-5 py-2.5 rounded-full flex-shrink-0 shadow-sm border ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-surface-container-lowest border-outline-variant/30 active:bg-surface-container-high"
              }`}
            >
              <Text
                className={`font-label-sm text-label-sm font-bold ${
                  isActive ? "text-on-primary" : "text-on-surface-variant"
                }`}
              >
                {option.label}
              </Text>
              {option.count !== undefined && option.count > 0 && (
                <View className="bg-warning w-4 h-4 rounded-full flex items-center justify-center mr-2">
                  <Text className="text-white text-[10px] font-bold">
                    {option.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
