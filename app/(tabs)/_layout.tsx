import type { Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { usePushNotifications } from '@/features/auth/hooks/usePushNotifications';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { AppText as Text } from '@/shared/components/AppText';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { AppColors } from '@/shared/lib/colors';

type TabRoute = 'index' | 'orders' | 'my-cars' | 'profile';

const TAB_META: Record<
 TabRoute,
 { title: string; icon: React.ComponentProps<typeof Feather>['name'] }
> = {
 index: { title: 'الرئيسية', icon: 'home' },
 orders: { title: 'حجوزاتي', icon: 'calendar' },
 'my-cars': { title: 'سياراتي', icon: 'truck' },
 profile: { title: 'حسابي', icon: 'user' },
};



function CustomerTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
 const insets = useSafeAreaInsets();

 return (
 <View
 className="flex-row-reverse items-center justify-around border-t border-outline-variant bg-surface-container-lowest px-4 pt-2"
 style={{ paddingBottom: Math.max(insets.bottom, 8) }}
 >
 {state.routes.map((route, index) => {
 const meta = TAB_META[route.name as TabRoute];
 if (!meta) return null;

 const { options } = descriptors[route.key];
 const label = options.title ?? meta.title;
 const isFocused = state.index === index;

 const onPress = () => {
 const event = navigation.emit({
 type: 'tabPress',
 target: route.key,
 canPreventDefault: true,
 });

 if (!isFocused && !event.defaultPrevented) {
 navigation.navigate(route.name);
 }
 };

 return (
 <Pressable
 key={route.key}
 accessibilityLabel={label}
 accessibilityRole="tab"
 accessibilityState={{ selected: isFocused }}
 className="min-w-[72px] items-center justify-center rounded-xl px-2 py-2 active:opacity-80"
 onPress={onPress}
 >
 <Feather color={isFocused ? AppColors.primary : AppColors.outline} name={meta.icon} size={22} />
 <Text
 className={`font-sans mt-1 text-xs ${isFocused ? 'font-bold text-primary' : 'text-on-surface-variant'}`}
 >
 {label}
 </Text>
 </Pressable>
 );
 })}
 </View>
 );
}

export default function CustomerTabsLayout() {
 const { errorMessage, hasHydrated, status, user } = useAuthStore();

 usePushNotifications(user?.role === 'customer' ? user : null);

 useEffect(() => {
 if (user?.role === 'customer') {
 void useServiceStore.getState().loadActiveServices();
 void useBranchStore.getState().loadActiveBranches();
 }
 }, [user?.id, user?.role]);

 if (!hasHydrated || status === 'idle' || status === 'loading') {
 return (
 <ScreenContainer scroll={false}>
 <LoadingSpinner label="جارٍ التحقق..." />
 </ScreenContainer>
 );
 }

 if (!user) {
 if (status === 'blocked') {
 return <AuthBlockedState message={errorMessage ?? 'ملفك الشخصي غير جاهز بعد.'} />;
 }

 return <Redirect href="/login" />;
 }

 if (user.role !== 'customer') {
 return <Redirect href={getHomePathForRole(user.role) as Href} />;
 }

 return (
 <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomerTabBar {...props} />}>
 <Tabs.Screen name="index" options={{ title: 'الرئيسية' }} />
 <Tabs.Screen name="orders" options={{ title: 'حجوزاتي' }} />
 <Tabs.Screen name="my-cars" options={{ title: 'سياراتي' }} />
 <Tabs.Screen name="profile" options={{ title: 'حسابي' }} />
 </Tabs>
 );
}
