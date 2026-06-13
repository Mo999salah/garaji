import { router } from 'expo-router';
import { ScrollView, View, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

import { useAdminTechniciansQuery } from '@/features/operations/hooks/useTechniciansQuery';
import type { Technician } from '@/features/operations/types';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppHeader } from '@/shared/components/AppHeader';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { AppColors } from '@/shared/lib/colors';

function AdminTechnicianCard({ technician, onPress }: { technician: Technician; onPress: () => void }) {
  const isAvailable = technician.isActive;

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityLabel={`${technician.fullName} - ${isAvailable ? 'متاح' : 'غير نشط'}`}
      accessibilityHint="عرض تفاصيل الفني"
      accessibilityRole="button"
      className="bg-surface-container-lowest rounded-3xl p-4 flex-row-reverse items-center shadow-soft mb-3"
    >
      <View className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center ml-4 shrink-0 overflow-hidden relative">
        <MaterialIcons name="person" size={24} color={AppColors.onSurfaceVariant} />
      </View>

      <View className="flex-1 flex-col justify-center items-end">
        <Text className="text-body-md text-on-surface mb-1 font-bold text-right">{technician.fullName}</Text>

        <View className="flex-row-reverse items-center gap-2 mb-1">
          <Text className="font-label-sm text-label-sm text-on-surface-variant">
            {technician.specialties?.length ? technician.specialties.join('، ') : 'عام'}
          </Text>
          {technician.phone && (
            <>
              <View className="w-1 h-1 rounded-full bg-outline-variant" />
              <Text className="font-label-sm text-label-sm text-on-surface-variant" style={{ writingDirection: 'ltr' }}>
                {technician.phone}
              </Text>
            </>
          )}
        </View>

        <View className="flex-row-reverse items-center gap-1.5 mt-0.5">
          <View className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-success' : 'bg-error'}`} />
          <Text className={`font-label-sm text-label-sm ${isAvailable ? 'text-success' : 'text-error'}`}>
            {isAvailable ? 'متاح' : 'غير نشط'}
          </Text>
        </View>
      </View>

      <View className="flex-col items-end gap-2 ml-2">
        <View className="bg-surface-container-low px-2 py-1 rounded-lg">
          <Text className="font-label-sm text-label-sm text-on-surface-variant text-center">طلبات</Text>
        </View>
        <MaterialIcons name="chevron-left" size={20} color={AppColors.outline} className="mt-1" />
      </View>
    </AnimatedPressable>
  );
}

export default function AdminTechniciansScreen() {
 const techniciansQuery = useAdminTechniciansQuery();
 const { data: technicians = [], isLoading } = techniciansQuery;
 const refreshControl = useScreenRefresh(techniciansQuery.refetch);
 
 const [searchQuery, setSearchQuery] = useState('');

 const filteredTechnicians = technicians.filter(tech => 
 tech.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 tech.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (tech.phone && tech.phone.includes(searchQuery))
 );

  const handleAddTechnician = () => router.push('/(admin)/technicians/new');

  return (
    <View className="flex-1 bg-background pb-[80px] relative">
      <AppHeader
        title="الفنيون"
        showBack
        onBack={() => router.back()}
        trailing={
          <AnimatedPressable
            onPress={handleAddTechnician}
            accessibilityLabel="إضافة فني"
            accessibilityHint="الانتقال لشاشة إضافة فني جديد"
            accessibilityRole="button"
            className="w-10 h-10 flex items-center justify-center rounded-full"
          >
            <MaterialIcons name="add" size={24} color={AppColors.primary} />
          </AnimatedPressable>
        }
      />

      <ScrollView
        contentContainerClassName="px-margin-mobile py-stack-md flex-col gap-stack-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {/* Search Bar */}
  <View className="relative w-full flex-row-reverse items-center">
          <View className="absolute right-0 pr-4 flex items-center justify-center z-10 pointer-events-none">
            <MaterialIcons name="search" size={24} color={AppColors.onSurfaceVariant} />
          </View>
          <TextInput
            className="w-full h-12 pr-12 pl-4 bg-surface-container-low border-none rounded-2xl text-body-md font-body-md text-on-surface text-right"
            placeholder="بحث عن فني"
            placeholderTextColor={AppColors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="البحث عن فني"
            accessibilityRole="search"
          />
        </View>

 {isLoading ? (
 <LoadingSpinner label="جارٍ تحميل الفنيين..." />
 ) : filteredTechnicians.length === 0 ? (
 <EmptyState
 message={searchQuery ? "لم يتم العثور على فنيين يطابقون بحثك." : "أضف أول فني لربطه بالطلبات."}
 title={searchQuery ? "لا توجد نتائج" : "لا يوجد فنيون"}
 />
 ) : (
 <View className="flex-col gap-3">
 {filteredTechnicians.map((technician) => (
 <AdminTechnicianCard
 key={technician.id}
 technician={technician}
 onPress={() =>
 router.push({
 pathname: '/(admin)/technicians/[id]/edit',
 params: { id: technician.id },
 })
 }
 />
 ))}
 </View>
 )}
 </ScrollView>

  {/* Floating Action Button */}
  <AnimatedPressable
        onPress={handleAddTechnician}
        accessibilityLabel="إضافة فني"
        accessibilityHint="الانتقال لشاشة إضافة فني جديد"
        accessibilityRole="button"
        className="absolute bottom-margin-mobile left-margin-mobile w-14 h-14 bg-primary-container rounded-full shadow-elevated flex items-center justify-center z-50"
      >
        <MaterialIcons name="add" size={28} color={AppColors.onPrimaryContainer} />
      </AnimatedPressable>
    </View>
  );
}
