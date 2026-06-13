import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useActiveBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import type { Branch } from '@/features/branches/types';
import {
 AppMapCallout,
 AppMapMarker,
 AppMapView,
 type AppMapRegion,
} from '@/shared/components/AppMap';
import { AppButton } from '@/shared/components/AppButton';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppColors } from '@/shared/lib/colors';

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

function BranchesIndexScreen() {
 const { data: branches = [], error, isLoading } = useActiveBranchesQuery();
 const [userRegion, setUserRegion] = useState<AppMapRegion | undefined>();
 const [searchQuery, setSearchQuery] = useState('');

 const activeBranches = useMemo(() => branches.filter((branch) => branch.isActive), [branches]);
 const locatedBranches = useMemo(
 () => activeBranches.filter(hasBranchCoordinates),
 [activeBranches],
 );
 
 const filteredBranches = useMemo(() => {
 if (!searchQuery) return activeBranches;
 return activeBranches.filter(branch => 
 branch.name.includes(searchQuery) || 
 (branch.address && branch.address.includes(searchQuery))
 );
 }, [activeBranches, searchQuery]);

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
 pathname: '/book-branch',
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
  <View className="flex-1 bg-background pb-24">
      <AppHeader
        title="مراكز الخدمة"
        showBack
        onBack={() => router.back()}
      />

  <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
 {/* Search Bar */}
 <View className="px-margin-mobile py-stack-md">
 <View className="relative">
  <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن مركز خدمة..."
            placeholderTextColor={AppColors.onSurfaceVariant}
            accessibilityLabel="البحث عن مركز خدمة"
            accessibilityRole="search"
            className="w-full h-12 bg-surface-container-lowest rounded-2xl pr-4 pl-12 text-body-md text-right font-body-md text-on-surface border border-surface-container shadow-soft"
          />
  <View className="absolute left-4 top-1/2 -translate-y-1/2">
  <MaterialIcons name="search" size={24} color={AppColors.onSurfaceVariant} />
  </View>
 </View>
 </View>

 {/* Map Area */}
 <View className="relative w-full h-64 bg-surface-container shadow-soft mb-stack-md overflow-hidden">
 <AppMapView
 className="h-full w-full opacity-80 mix-blend-multiply"
 initialRegion={initialRegion}
 onRegionChangeComplete={setUserRegion}
 region={userRegion ?? undefined}
 showsUserLocation={Boolean(userRegion)}
 showsMyLocationButton={false}
 scrollEnabled={false}
 zoomEnabled={false}
 pitchEnabled={false}
 rotateEnabled={false}
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
  <View className="min-w-56 rounded-lg bg-surface-container-lowest p-4 shadow-sm border border-surface-container">
  <Text className="text-title-md text-right font-bold text-on-surface">
  {branch.name}
  </Text>
  <Text className="font-label-sm mt-1 text-right text-label-sm text-on-surface-variant">
  {branch.city}
  </Text>
  <Text
  className="text-body-md mt-1 text-right text-on-surface-variant"
  numberOfLines={2}
  >
  {branch.address}
  </Text>
  </View>
 </AppMapCallout>
 </AppMapMarker>
 ))}
 </AppMapView>
 
  <View className="absolute bottom-4 right-4 z-10">
  <AnimatedPressable
            onPress={handleLocateMe}
            accessibilityLabel="تحديد موقعي"
            accessibilityRole="button"
            className="bg-surface-container-lowest p-2 rounded-full shadow-md border border-surface-container"
          >
  <MaterialIcons name="my-location" size={20} color={AppColors.primary} />
  </AnimatedPressable>
  </View>
 </View>

 {/* Branch List */}
 <View className="px-margin-mobile flex-col gap-stack-md pb-8">
 {isLoading ? (
 <LoadingSpinner label="جارٍ تحميل الفروع..." />
 ) : error ? (
 <EmptyState
 message={error instanceof Error ? error.message : 'تعذّر تحميل الفروع.'}
 title="خطأ في التحميل"
 />
 ) : filteredBranches.length === 0 ? (
 <EmptyState message="لا توجد فروع مطابقة لبحثك." title="لا توجد فروع" />
 ) : (
 filteredBranches.map((branch) => (
 <View key={branch.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col gap-3">
  <View className="flex-row-reverse justify-between items-start">
  <View className="items-end">
  <Text className="text-title-md font-bold text-on-surface text-right">{branch.name}</Text>
  </View>
  </View>

  <View className="flex-row-reverse items-center gap-2">
  <MaterialIcons name="map" size={16} color={AppColors.onSurfaceVariant} />
  <Text className="text-label-sm font-label-sm text-on-surface-variant text-right">
  {branch.address}
  </Text>
  </View>

          <AppButton
            onPress={() => handleBookBranch(branch.id)}
            label="حجز موعد"
            accessibilityLabel={`حجز موعد في ${branch.name}`}
            className="mt-2 w-full"
          />
 </View>
 ))
 )}
 </View>
 </ScrollView>
 </View>
 );
}

export default function ServiceCentersRoute() {
 return (
 <RoleGate role="customer">
 <BranchesIndexScreen />
 </RoleGate>
 );
}
