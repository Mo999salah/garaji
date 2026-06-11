import { router } from 'expo-router';
import { ScrollView, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAllBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import type { Branch } from '@/features/branches/types';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

function AdminBranchCard({ branch, onPress }: { branch: Branch; onPress: () => void }) {
  // Mocking status logic. In reality, we might calculate this based on current time and operatingHours
  const isOpen = branch.isActive;

  return (
    <Pressable 
      onPress={onPress}
      className={`bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex-col transition-transform active:scale-[0.98] mb-stack-lg ${!isOpen ? 'opacity-90' : ''}`}
    >
      <View className="p-4 flex-col gap-stack-md">
        <View className="flex-row-reverse justify-between items-start">
          <Text className="font-button-text text-button-text text-on-surface">{branch.name}</Text>
          {isOpen ? (
            <View className="inline-flex flex-row-reverse items-center gap-1 bg-[#d1fae5] px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <Text className="text-[#065f46] text-label-sm font-label-sm">مفتوح</Text>
            </View>
          ) : (
            <View className="inline-flex flex-row-reverse items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-outline" />
              <Text className="text-on-surface-variant text-label-sm font-label-sm">مغلق</Text>
            </View>
          )}
        </View>

        <View className="flex-col gap-stack-sm">
          <View className="flex-row-reverse items-center gap-2">
            <MaterialIcons name="location-on" size={18} color="#3d4947" />
            <Text className="text-on-surface-variant font-label-sm text-label-sm">{branch.address || 'عنوان الفرع غير محدد'}</Text>
          </View>
          <View className="flex-row-reverse items-center gap-2">
            <MaterialIcons name="schedule" size={18} color="#3d4947" />
            <Text className="text-on-surface-variant font-label-sm text-label-sm text-right" style={{ writingDirection: 'ltr' }}>{branch.workingHours || 'ساعات العمل غير محددة'}</Text>
          </View>
        </View>
      </View>

      {/* Map Preview Area */}
      <View className={`w-full h-32 bg-surface-container-low relative flex items-center justify-center overflow-hidden ${!isOpen ? 'opacity-70' : ''}`}>
        <View className="absolute inset-0 opacity-20" style={{ backgroundColor: '#e2e2e3' }} />
        <View className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform ${isOpen ? 'bg-primary-container text-on-primary-container' : 'bg-outline text-surface'}`}>
          <MaterialIcons name="pin-drop" size={24} color={isOpen ? '#f4fffc' : '#f9f9fa'} />
        </View>
      </View>
    </Pressable>
  );
}

export default function AdminBranchesScreen() {
  const branchesQuery = useAllBranchesQuery();
  const { data: branches = [], isLoading } = branchesQuery;
  const refreshControl = useScreenRefresh(branchesQuery.refetch);

  return (
    <View className="flex-1 bg-background pb-[80px] relative">
      {/* Top Navigation Bar */}
      <View className="bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.04)] w-full top-0 sticky z-40 flex flex-row-reverse justify-between items-center px-margin-mobile h-16 transition-all duration-300">
        <Pressable 
          onPress={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:opacity-80"
        >
          <MaterialIcons name="arrow-forward" size={24} color="#3d4947" />
        </Pressable>
        <Text className="font-title-md text-[20px] font-bold text-primary flex-1 text-center">الفروع</Text>
        <Pressable 
          onPress={() => router.push('/(admin)/branches/new')}
          className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-low transition-colors active:opacity-80"
        >
          <MaterialIcons name="add" size={24} color="#00685f" />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerClassName="px-margin-mobile py-stack-md flex-col gap-stack-lg"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل الفروع..." />
        ) : branches.length === 0 ? (
          <EmptyState
            message="لا توجد فروع بعد. أضف أول فرع لبدء العمل."
            title="لا توجد فروع"
          />
        ) : (
          <View>
            {branches.map((branch) => (
              <AdminBranchCard
                branch={branch}
                key={branch.id}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/branches/[id]/edit',
                    params: { id: branch.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
