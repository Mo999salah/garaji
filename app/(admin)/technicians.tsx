import { router } from 'expo-router';
import { ScrollView, View, Pressable, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

import { useAdminTechniciansQuery } from '@/features/operations/hooks/useTechniciansQuery';
import type { Technician } from '@/features/operations/types';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

function AdminTechnicianCard({ technician, onPress }: { technician: Technician; onPress: () => void }) {
 // Using isActive to determine if available (mocking status for UI)
 const isAvailable = technician.isActive;
 
 return (
 <Pressable 
 onPress={onPress}
 className="bg-surface-container-lowest rounded-3xl p-4 flex-row-reverse items-center shadow-soft mb-3 active:scale-[0.98]"
 >
 <View className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center ml-4 shrink-0 overflow-hidden relative">
 {/* We don't have images in the backend model, so we show a fallback icon */}
 <MaterialIcons name="person" size={24} color="#3d4947" />
 </View>
 
 <View className="flex-1 flex-col justify-center items-end">
 <Text className="font-button-text text-[16px] text-on-surface mb-1 font-bold text-right">{technician.fullName}</Text>
 
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
 <View className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
 <Text className={`font-label-sm text-[12px] ${isAvailable ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
 {isAvailable ? 'متاح' : 'غير نشط'}
 </Text>
 </View>
 </View>

 <View className="flex-col items-end gap-2 ml-2">
 {/* Mocked completed orders badge as requested by design */}
 <View className="bg-surface-container-low px-2 py-1 rounded-lg">
 <Text className="font-label-sm text-[12px] text-on-surface-variant text-center">طلبات</Text>
 </View>
 <MaterialIcons name="chevron-left" size={20} color="#6d7a77" className="mt-1" />
 </View>
 </Pressable>
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

 return (
 <View className="flex-1 bg-background pb-[80px] relative">
 {/* Top Navigation Bar */}
 <View className="bg-surface shadow-soft w-full z-40 flex flex-row-reverse justify-between items-center px-margin-mobile h-16">
 <Pressable 
 onPress={() => router.back()} 
 className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-80"
 >
 <MaterialIcons name="arrow-forward" size={24} color="#3d4947" />
 </Pressable>
 <Text className="font-display-lg-mobile text-[28px] font-extrabold text-primary flex-1 text-center tracking-tight">Garaji</Text>
 <Pressable 
 onPress={() => router.push('/(admin)/technicians/new')}
 className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-80"
 >
 <MaterialIcons name="add" size={24} color="#00685f" />
 </Pressable>
 </View>

 <ScrollView 
 contentContainerClassName="px-margin-mobile py-stack-md flex-col gap-stack-lg"
 showsVerticalScrollIndicator={false}
 refreshControl={refreshControl}
 >
 {/* Header Section */}
 <View className="flex-row-reverse items-center justify-between">
 <Text className="font-display-lg-mobile text-[28px] font-extrabold text-[#1A1A2E]">الفنيون</Text>
 <Pressable 
 onPress={() => router.push('/(admin)/technicians/new')}
 className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-[0px_8px_30px_rgba(0,0,0,0.08)] active:scale-95"
 >
 <MaterialIcons name="add" size={24} color="#ffffff" />
 </Pressable>
 </View>

 {/* Search Bar */}
 <View className="relative w-full flex-row-reverse items-center">
 <View className="absolute right-0 pr-4 flex items-center justify-center z-10 pointer-events-none">
 <MaterialIcons name="search" size={24} color="#6d7a77" />
 </View>
 <TextInput 
 className="w-full h-12 pr-12 pl-4 bg-surface-container-low border-none rounded-2xl text-[16px] font-body-md text-on-surface text-right"
 placeholder="بحث عن فني"
 placeholderTextColor="#6d7a77"
 value={searchQuery}
 onChangeText={setSearchQuery}
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
 <Pressable 
 onPress={() => router.push('/(admin)/technicians/new')}
 className="absolute bottom-margin-mobile left-margin-mobile w-14 h-14 bg-primary-container rounded-full shadow-[0px_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center z-50 active:scale-90"
 >
 <MaterialIcons name="add" size={28} color="#ffffff" />
 </Pressable>
 </View>
 );
}
