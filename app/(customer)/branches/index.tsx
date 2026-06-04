import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useActiveBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import type { Branch } from '@/features/branches/types';
import { AppButton } from '@/shared/components/AppButton';
import {
  AppMapCallout,
  AppMapMarker,
  AppMapView,
  type AppMapRegion,
} from '@/shared/components/AppMap';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

type ViewMode = 'list' | 'map';

const RIYADH_REGION: AppMapRegion = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

function hasBranchCoordinates(branch: Branch): branch is Branch & { lat: number; lng: number } {
  return typeof branch.lat === 'number' && typeof branch.lng === 'number';
}

function getRegionForBranches(branches: Branch[], userRegion?: AppMapRegion): AppMapRegion {
  if (userRegion) {
    return userRegion;
  }

  const locatedBranches = branches.filter(hasBranchCoordinates);

  if (!locatedBranches.length) {
    return RIYADH_REGION;
  }

  const latitude =
    locatedBranches.reduce((sum, branch) => sum + branch.lat, 0) / locatedBranches.length;
  const longitude =
    locatedBranches.reduce((sum, branch) => sum + branch.lng, 0) / locatedBranches.length;

  return {
    latitude,
    longitude,
    latitudeDelta: locatedBranches.length > 1 ? 0.25 : 0.08,
    longitudeDelta: locatedBranches.length > 1 ? 0.25 : 0.08,
  };
}

export default function BranchesIndexScreen() {
  const { data: branches = [], error, isLoading } = useActiveBranchesQuery();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userRegion, setUserRegion] = useState<AppMapRegion | undefined>();

  const activeBranches = useMemo(() => branches.filter((branch) => branch.isActive), [branches]);
  const locatedBranches = useMemo(
    () => activeBranches.filter(hasBranchCoordinates),
    [activeBranches],
  );
  const initialRegion = useMemo(
    () => getRegionForBranches(activeBranches, userRegion),
    [activeBranches, userRegion],
  );

  useEffect(() => {
    let isMounted = true;

    const loadUserRegion = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) {
          return;
        }

        setUserRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        });
      } catch {
        if (isMounted) {
          setUserRegion(undefined);
        }
      }
    };

    void loadUserRegion();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBookBranch = (branchId: string) => {
    router.push({
      pathname: '/(customer)/book/branch',
      params: { branchId },
    });
  };

  const handleLocateMe = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('الموقع غير مفعّل', 'يمكنك تصفح الفروع على الخريطة بدون مشاركة موقعك.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    } catch {
      Alert.alert('تعذّر تحديد الموقع', 'حاول مرة أخرى أو اختر الفرع من القائمة.');
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-5 px-5 py-5">
        <View className="flex-row-reverse items-start justify-between gap-3">
          <View className="flex-1 items-end gap-1">
            <Text className="font-sans text-right text-2xl font-bold text-ink dark:text-dark-ink">
              فروعنا
            </Text>
            <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
              اختر أقرب فرع أو افتح الخريطة لمعاينة المواقع.
            </Text>
          </View>
        </View>

        <View className="flex-row-reverse rounded-lg border border-line bg-card p-1 dark:border-dark-line dark:bg-dark-card">
          <SegmentButton
            active={viewMode === 'list'}
            label="عرض القائمة"
            onPress={() => setViewMode('list')}
          />
          <SegmentButton
            active={viewMode === 'map'}
            label="عرض الخريطة"
            onPress={() => setViewMode('map')}
          />
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner label="جارٍ تحميل الفروع..." />
      ) : error ? (
        <View className="px-5">
          <EmptyState
            message={error instanceof Error ? error.message : 'تعذّر تحميل الفروع.'}
            title="خطأ في التحميل"
          />
        </View>
      ) : activeBranches.length === 0 ? (
        <View className="px-5">
          <EmptyState message="لا توجد فروع متاحة حالياً." title="لا توجد فروع" />
        </View>
      ) : viewMode === 'list' ? (
        <ScrollView
          contentContainerClassName="gap-3 px-5 pb-6"
          showsVerticalScrollIndicator={false}
        >
          {activeBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 pb-5">
          <View className="mb-3 flex-row-reverse items-center justify-between gap-3">
            <Text className="font-sans flex-1 text-right text-sm text-muted dark:text-dark-muted">
              {locatedBranches.length
                ? `${locatedBranches.length.toLocaleString('ar-SA')} فرع ظاهر على الخريطة.`
                : 'لا توجد إحداثيات متاحة للفروع حالياً.'}
            </Text>
            <AppButton onPress={handleLocateMe} variant="secondary" className="min-w-28">
              موقعي
            </AppButton>
          </View>

          {locatedBranches.length ? (
            <View className="flex-1 overflow-hidden rounded-lg border border-line bg-card dark:border-dark-line dark:bg-dark-card">
              <AppMapView
                className="h-full w-full"
                initialRegion={initialRegion}
                onRegionChangeComplete={setUserRegion}
                region={userRegion ?? undefined}
                showsUserLocation={Boolean(userRegion)}
                showsMyLocationButton={false}
              >
                {locatedBranches.map((branch) => (
                  <AppMapMarker
                    coordinate={{ latitude: branch.lat, longitude: branch.lng }}
                    description={branch.address}
                    key={branch.id}
                    onCalloutPress={() => handleBookBranch(branch.id)}
                    title={branch.name}
                  >
                    <AppMapCallout tooltip>
                      <View className="min-w-56 rounded-lg border border-line bg-card p-4 shadow-sm shadow-brand-700/10 dark:border-dark-line dark:bg-dark-card">
                        <Text className="font-sans text-right text-base font-bold text-ink dark:text-dark-ink">
                          {branch.name}
                        </Text>
                        <Text className="font-sans mt-1 text-right text-xs text-muted dark:text-dark-muted">
                          {branch.city}
                        </Text>
                        <Text
                          className="font-sans mt-1 text-right text-xs text-muted dark:text-dark-muted"
                          numberOfLines={2}
                        >
                          {branch.address}
                        </Text>
                        <View className="mt-3 rounded-lg bg-brand-500 px-3 py-2">
                          <Text className="font-sans text-center text-sm font-bold text-white">
                            احجز في هذا الفرع
                          </Text>
                        </View>
                      </View>
                    </AppMapCallout>
                  </AppMapMarker>
                ))}
              </AppMapView>
            </View>
          ) : (
            <EmptyState
              message="بيانات الفروع موجودة، لكن لا توجد إحداثيات لعرضها على الخريطة."
              title="الخريطة غير متاحة"
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

function SegmentButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`min-h-11 flex-1 items-center justify-center rounded-lg px-3 ${
        active ? 'bg-brand-500 shadow-sm shadow-brand-700/20' : 'bg-transparent'
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-sans text-sm font-bold ${
          active ? 'text-white' : 'text-muted dark:text-dark-muted'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
