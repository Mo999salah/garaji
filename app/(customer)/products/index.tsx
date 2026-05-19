import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { ProductCard } from '@/features/products/components/ProductCard';
import { filterActiveProducts } from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerProductsScreen() {
  const [categoryId, setCategoryId] = useState('all');
  const [query, setQuery] = useState('');
  const products = useProductStore((state) => state.products);

  const filteredProducts = useMemo(
    () => filterActiveProducts(products, { categoryId, query }),
    [categoryId, products, query],
  );

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Catalog</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Find parts</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Search active products from approved merchants.
          </Text>
        </View>

        <AppInput
          accessibilityLabel="Search products"
          label="Search"
          onChangeText={setQuery}
          placeholder="Search by name, brand, or description"
          value={query}
        />

        <CategoryFilter onSelect={setCategoryId} selectedCategoryId={categoryId} />

        <View className="gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onPress={() => router.push(`/(customer)/products/${product.id}` as Href)}
                product={product}
              />
            ))
          ) : (
            <EmptyState
              title="No products found"
              message="Try another category or search term to broaden the catalog."
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
