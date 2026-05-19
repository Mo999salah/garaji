import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { formatProductPrice } from '@/features/products/selectors/productSelectors';
import type { Product } from '@/shared/types/product';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  rightSlot?: ReactNode;
  showStatus?: boolean;
}

export function ProductCard({ onPress, product, rightSlot, showStatus = false }: ProductCardProps) {
  const content = (
    <View className="flex-row gap-3">
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
        {product.imageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            className="h-full w-full"
            resizeMode="cover"
            source={{ uri: product.imageUrl }}
          />
        ) : (
          <Text className="text-center text-xs font-semibold text-brand-700">{product.brand}</Text>
        )}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-xs font-semibold uppercase text-muted">{product.brand}</Text>
        <Text className="mt-1 text-lg font-bold leading-6 text-ink">{product.name}</Text>

        <Text className="mt-2 text-sm leading-5 text-muted" numberOfLines={2}>
          {product.description}
        </Text>

        <View className="mt-3 gap-3">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-base font-bold text-brand-700">{formatProductPrice(product)}</Text>
            {showStatus ? (
              <Text
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  product.isActive ? 'bg-brand-50 text-brand-700' : 'bg-neutral-100 text-muted'
                }`}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </Text>
            ) : null}
          </View>
          {rightSlot ? <View className="gap-2">{rightSlot}</View> : null}
        </View>
      </View>
    </View>
  );

  if (!onPress) {
    return <View className="rounded-lg border border-line bg-white p-4">{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={`View ${product.name}`}
      accessibilityRole="button"
      className="rounded-lg border border-line bg-white p-4 active:opacity-80"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
