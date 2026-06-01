import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { ProductCard } from '@/features/products/components/ProductCard';
import {
  filterActiveProducts,
  getFitmentYearOptions,
  getVehicleMakeOptions,
  getVehicleModelOptions,
  isProductReadyToOrder,
  type ProductFilters,
} from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

function FilterChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`min-h-10 justify-center rounded-lg border px-3 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-brand-700' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CustomerProductsScreen() {
  const [categoryId, setCategoryId] = useState('all');
  const [query, setQuery] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [fitmentYear, setFitmentYear] = useState('');
  const [inventoryStatus, setInventoryStatus] =
    useState<ProductFilters['inventoryStatus']>('all');
  const products = useProductStore((state) => state.products);
  const fitmentYearNumber = Number(fitmentYear);
  const hasFitmentYear = fitmentYear.trim().length > 0 && Number.isFinite(fitmentYearNumber);
  const activeProducts = useMemo(() => products.filter((product) => product.isActive), [products]);
  const vehicleMakeOptions = useMemo(() => getVehicleMakeOptions(activeProducts), [activeProducts]);
  const vehicleModelOptions = useMemo(
    () => getVehicleModelOptions(activeProducts, vehicleMake),
    [activeProducts, vehicleMake],
  );
  const fitmentYearOptions = useMemo(
    () =>
      getFitmentYearOptions(activeProducts, {
        categoryId,
        query,
        vehicleMake,
        vehicleModel,
      }),
    [activeProducts, categoryId, query, vehicleMake, vehicleModel],
  );
  const hasFilters =
    Boolean(query.trim()) ||
    Boolean(vehicleMake.trim()) ||
    Boolean(vehicleModel.trim()) ||
    Boolean(fitmentYear.trim()) ||
    inventoryStatus !== 'all' ||
    categoryId !== 'all';

  const filteredProducts = useMemo(
    () =>
      filterActiveProducts(products, {
        categoryId,
        query,
        vehicleMake,
        vehicleModel,
        fitmentYear: hasFitmentYear ? fitmentYearNumber : undefined,
        inventoryStatus,
      }),
    [
      categoryId,
      fitmentYearNumber,
      hasFitmentYear,
      products,
      query,
      inventoryStatus,
      vehicleMake,
      vehicleModel,
    ],
  );
  const activeProductCount = activeProducts.length;
  const readyProductCount = activeProducts.filter(isProductReadyToOrder).length;

  const clearFilters = () => {
    setCategoryId('all');
    setQuery('');
    setVehicleMake('');
    setVehicleModel('');
    setFitmentYear('');
    setInventoryStatus('all');
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
            {filteredProducts.length} of {activeProductCount} active products - {readyProductCount}{' '}
            ready to order
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
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Make</Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterChip
                label="All"
                onPress={() => {
                  setVehicleMake('');
                  setVehicleModel('');
                  setFitmentYear('');
                }}
                selected={!vehicleMake}
              />
              {vehicleMakeOptions.map((make) => (
                <FilterChip
                  key={make}
                  label={make}
                  onPress={() => {
                    setVehicleMake(make);
                    setVehicleModel('');
                    setFitmentYear('');
                  }}
                  selected={vehicleMake === make}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Model</Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterChip
                label="All"
                onPress={() => {
                  setVehicleModel('');
                  setFitmentYear('');
                }}
                selected={!vehicleModel}
              />
              {vehicleModelOptions.map((model) => (
                <FilterChip
                  key={model}
                  label={model}
                  onPress={() => {
                    setVehicleModel(model);
                    setFitmentYear('');
                  }}
                  selected={vehicleModel === model}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Year</Text>
            <View className="flex-row flex-wrap gap-2">
              <FilterChip label="All" onPress={() => setFitmentYear('')} selected={!fitmentYear} />
              {fitmentYearOptions.slice(0, 12).map((year) => (
                <FilterChip
                  key={year}
                  label={String(year)}
                  onPress={() => setFitmentYear(String(year))}
                  selected={fitmentYear === String(year)}
                />
              ))}
            </View>
          </View>
          {hasFilters ? (
            <AppButton onPress={clearFilters} variant="ghost">
              Clear filters
            </AppButton>
          ) : null}
        </View>

        <View className="gap-3 rounded-lg border border-line bg-white p-4">
          <Text className="text-base font-semibold text-ink">Availability</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppButton
                onPress={() => setInventoryStatus('all')}
                variant={inventoryStatus === 'all' ? 'primary' : 'secondary'}
              >
                All
              </AppButton>
            </View>
            <View className="flex-1">
              <AppButton
                onPress={() => setInventoryStatus('in_stock')}
                variant={inventoryStatus === 'in_stock' ? 'primary' : 'secondary'}
              >
                Ready
              </AppButton>
            </View>
          </View>
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
