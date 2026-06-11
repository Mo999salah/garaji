import { router } from 'expo-router';
import { ScrollView, View, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAllServicesQuery } from '@/features/services/hooks/useServicesQuery';
import type { Service } from '@/features/services/types';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

function AdminServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  return (
    <Pressable 
      onPress={onPress}
      className={`bg-surface rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-4 flex-col gap-1 relative mb-4 active:scale-[0.98] ${!service.isActive ? 'opacity-75' : ''}`}
    >
      <View className="flex-row-reverse justify-between items-start">
        <View className="flex-1 items-end">
          <Text className="font-button-text text-[16px] font-bold text-on-surface mb-1 text-right">{service.name}</Text>
          {service.description ? (
            <Text className="font-label-sm text-[13px] text-on-surface-variant text-right">{service.description}</Text>
          ) : null}
        </View>
        <View className="mr-2 mt-1">
          <Switch
            value={service.isActive}
            onValueChange={() => {
              // This should trigger an optimistic update or mutation in a real scenario
            }}
            trackColor={{ false: '#e2e2e3', true: '#008378' }}
            thumbColor={'#ffffff'}
          />
        </View>
      </View>
      
      <View className="flex-row-reverse items-center gap-4 mt-2 pt-2 border-t border-surface-container-low">
        {service.estimatedPrice !== undefined && (
          <View className="flex-row-reverse items-center gap-1">
            <MaterialIcons name="payments" size={16} color="#00685f" />
            <Text className="font-button-text text-[16px] font-bold text-primary">{service.estimatedPrice} ريال</Text>
          </View>
        )}
        {service.durationMinutes !== undefined && (
          <View className="flex-row-reverse items-center gap-1 text-on-surface-variant">
            <MaterialIcons name="schedule" size={16} color="#3d4947" />
            <Text className="font-label-sm text-[13px]">{service.durationMinutes} دقيقة</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function AdminServicesScreen() {
  const servicesQuery = useAllServicesQuery();
  const { data: services = [], isLoading } = servicesQuery;
  const refreshControl = useScreenRefresh(servicesQuery.refetch);

  return (
    <View className="flex-1 bg-background pb-24 relative">
      {/* Top Navigation Bar */}
      <View className="flex-row-reverse justify-between items-center px-margin-mobile h-16 w-full z-40 bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
        <Pressable 
          onPress={() => router.back()} 
          className="p-2 rounded-full active:opacity-80 flex items-center justify-center"
        >
          <MaterialIcons name="arrow-forward" size={24} color="#3d4947" />
        </Pressable>
        <Text className="font-title-md text-[20px] font-bold text-on-surface flex-1 text-center">الخدمات</Text>
        <Pressable 
          onPress={() => router.push('/(admin)/services/new')}
          className="p-2 rounded-full active:opacity-80 flex items-center justify-center"
        >
          <MaterialIcons name="add" size={24} color="#00685f" />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerClassName="px-margin-mobile py-stack-md"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل الخدمات..." />
        ) : services.length === 0 ? (
          <EmptyState
            message="لا توجد خدمات بعد. أضف أول خدمة لبدء العمل."
            title="لا توجد خدمات"
          />
        ) : (
          <View>
            {services.map((service) => (
              <AdminServiceCard
                key={service.id}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/services/[id]/edit',
                    params: { id: service.id },
                  })
                }
                service={service}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable 
        onPress={() => router.push('/(admin)/services/new')}
        className="absolute bottom-margin-mobile left-margin-mobile w-14 h-14 bg-primary-container rounded-full shadow-[0px_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center z-50 active:scale-95"
      >
        <MaterialIcons name="add" size={24} color="#ffffff" />
      </Pressable>
    </View>
  );
}
