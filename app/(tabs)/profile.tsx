import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

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
      {/* Top App Bar */}
      <View className="bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-row-reverse justify-between items-center px-margin-mobile py-4 z-50">
        <View className="w-10 h-10" />
        <Text className="font-title-md text-[20px] leading-[28px] text-primary flex-1 text-center font-bold">الملف الشخصي</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView 
        contentContainerClassName="px-margin-mobile pt-stack-md flex-col gap-stack-lg pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Animated.View 
          entering={FadeInUp.delay(100).springify()}
          className="bg-surface-container-lowest rounded-[24px] shadow-soft p-6 flex-col items-center"
        >
          <View className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-4">
            <Feather name="user" size={32} color="#00685f" />
          </View>
          <Text className="font-title-lg text-[24px] font-bold text-on-surface mb-1">
            {user?.fullName ?? (user?.role === 'customer' ? 'عميل' : 'مستخدم')}
          </Text>
          <Text className="font-body-md text-[16px] text-on-surface-variant opacity-80">
            {user?.email ? user.email : (user?.id ? user.id.slice(0, 8) : 'بريد إلكتروني غير متاح')}
          </Text>
        </Animated.View>

        {/* Menu Items */}
        <View className="flex-col gap-3 mt-4">
          {menuItems.map((item, index) => (
            <Animated.View key={item.title} entering={FadeInUp.delay(200 + index * 100).springify()}>
              <AnimatedPressable
                onPress={item.onPress}
                className="w-full bg-surface-container-lowest rounded-[20px] p-4 shadow-soft flex-row-reverse items-center justify-between"
              >
                <View className="flex-row-reverse items-center gap-4">
                  <View className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.isDestructive ? 'bg-error/10' : 'bg-primary-container'
                  }`}>
                    <Feather 
                      name={item.icon} 
                      size={24} 
                      color={item.isDestructive ? '#ba1a1a' : '#00685f'} 
                    />
                  </View>
                  <Text className={`font-title-md text-[16px] font-bold ${
                    item.isDestructive ? 'text-error' : 'text-on-surface'
                  }`}>
                    {item.title}
                  </Text>
                </View>
                <MaterialIcons 
                  name="chevron-left" 
                  size={24} 
                  color={item.isDestructive ? '#ba1a1a' : '#63627a'} 
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
