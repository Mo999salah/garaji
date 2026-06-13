import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppHeader } from '@/shared/components/AppHeader';
import { AppColors } from '@/shared/lib/colors';

export default function ProfileScreen() {
 const { user, signOut } = useAuthStore();

 const handleSignOut = async () => {
 await signOut();
 router.replace('/login');
 };

 const menuItems = [
 {
 title: 'الإشعارات',
 icon: 'bell' as const,
 onPress: () => router.push('/notifications'),
 },
 {
 title: 'الدعم الفني',
 icon: 'help-circle' as const,
 onPress: () => {}, // To be implemented or linked to WhatsApp
 },
 {
 title: 'تسجيل الخروج',
 icon: 'log-out' as const,
 onPress: handleSignOut,
 isDestructive: true,
 },
 ];

 return (
 <View className="flex-1 bg-surface">
      <AppHeader title="الملف الشخصي" showBack={false} />

 <ScrollView 
 contentContainerClassName="px-margin-mobile pt-stack-md flex-col gap-stack-lg pb-32"
 showsVerticalScrollIndicator={false}
 >
 {/* User Info Card */}
 <Animated.View 
 entering={FadeInUp.delay(100).springify()}
 className="bg-surface-container-lowest rounded-3xl shadow-soft p-6 flex-col items-center"
 >
  <View className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-4">
  <Feather name="user" size={32} color={AppColors.onSecondaryContainer} />
  </View>
  <Text className="text-title-lg font-bold text-on-surface mb-1">
  {user?.fullName ?? (user?.role === 'customer' ? 'عميل' : 'مستخدم')}
  </Text>
  <Text className="text-body-md text-on-surface-variant opacity-80">
  {user?.phone ? user.phone : (user?.id ? user.id.slice(0, 8) : 'معلومات غير متاحة')}
  </Text>
 </Animated.View>

 {/* Menu Items */}
 <View className="flex-col gap-3 mt-4">
 {menuItems.map((item, index) => (
 <Animated.View key={item.title} entering={FadeInUp.delay(200 + index * 100).springify()}>
  <AnimatedPressable
            onPress={item.onPress}
            accessibilityLabel={item.title}
            accessibilityRole="button"
            accessibilityState={{ disabled: !item.onPress }}
            className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-row-reverse items-center justify-between"
          >
            <View className="flex-row-reverse items-center gap-4">
              <View className={`w-12 h-12 rounded-full flex items-center justify-center ${
                item.isDestructive ? 'bg-error/10' : 'bg-primary-container'
              }`}>
                <Feather
                  name={item.icon}
                  size={24}
                  color={item.isDestructive ? AppColors.error : AppColors.onPrimaryContainer}
                />
              </View>
              <Text className={`text-title-md font-bold ${
                item.isDestructive ? 'text-error' : 'text-on-surface'
              }`}>
                {item.title}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={item.isDestructive ? AppColors.error : AppColors.onSecondaryContainer}
              style={{ opacity: 0.5 }}
            />
          </AnimatedPressable>
 </Animated.View>
 ))}
 </View>
 </ScrollView>
 </View>
 );
}
