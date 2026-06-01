import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { ProductCard } from '@/features/products/components/ProductCard';
import { filterActiveProducts } from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerProductsScreen() {
  const [categoryId, setCategoryId] = useState('all');
  const [query, setQuery] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [fitmentYear, setFitmentYear] = useState('');
  const products = useProductStore((state) => state.products);
  const fitmentYearNumber = Number(fitmentYear);
  const hasFitmentYear = fitmentYear.trim().length > 0 && Number.isFinite(fitmentYearNumber);
  const hasFilters =
    Boolean(query.trim()) ||
    Boolean(vehicleMake.trim()) ||
    Boolean(vehicleModel.trim()) ||
    Boolean(fitmentYear.trim()) ||
    categoryId !== 'all';

  const filteredProducts = useMemo(
    () =>
      filterActiveProducts(products, {
        categoryId,
        query,
        vehicleMake,
        vehicleModel,
        fitmentYear: hasFitmentYear ? fitmentYearNumber : undefined,
      }),
    [
      categoryId,
      fitmentYearNumber,
      hasFitmentYear,
      products,
      query,
      vehicleMake,
      vehicleModel,
    ],
  );
  const activeProductCount = products.filter((product) => product.isActive).length;

  const clearFilters = () => {
    setCategoryId('all');
    setQuery('');
    setVehicleMake('');
    setVehicleModel('');
    setFitmentYear('');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Catalog</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Find parts</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Search active products from approved merchants.
          </Text>
          <Text className="mt-2 text-sm text-muted">
            {filteredProducts.length} of {activeProductCount} active products
          </Text>
        </View>

        <AppInput
          accessibilityLabel="Search products"
          label="Search"
          onChangeText={setQuery}
          placeholder="Search by name, brand, part number, or description"
          value={query}
        />

        <View className="gap-3 rounded-lg border border-line bg-white p-4">
          <Text className="text-base font-semibold text-ink">Vehicle fitment</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <AppInput
                label="Make"
                onChangeText={setVehicleMake}
                placeholder="Toyota"
                value={vehicleMake}
              />
            </View>
            <View className="flex-1">
              <AppInput
                label="Model"
                onChangeText={setVehicleModel}
                placeholder="Hiace"
                value={vehicleModel}
              />
            </View>
          </View>
          <AppInput
            inputMode="numeric"
            keyboardType="number-pad"
            label="Year"
            onChangeText={setFitmentYear}
            placeholder="2020"
            value={fitmentYear}
          />
          {hasFilters ? (
            <AppButton onPress={clearFilters} variant="ghost">
              Clear filters
            </AppButton>
          ) : null}
        </View>

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
