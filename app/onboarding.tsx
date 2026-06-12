import { useState, useRef } from 'react';
import { View, ScrollView, useWindowDimensions, Pressable, I18nManager } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

import { AppText as Text } from '@/shared/components/AppText';
import { AppButton } from '@/shared/components/AppButton';



const ONBOARDING_DATA = [
 {
 id: '1',
 title: 'صيانة متنقلة لسيارتك',
 description: 'نصلك أينما كنت. فريقنا من الفنيين المعتمدين جاهز لخدمتك في مكانك لتوفير وقتك وجهدك.',
 icon: 'tool' as const,
 },
 {
 id: '2',
 title: 'أسعار شفافة ومضمونة',
 description: 'لا مفاجآت في الفاتورة! نقدم لك عروض أسعار واضحة ومفصلة قبل البدء في أي عمل صيانة.',
 icon: 'shield' as const,
 },
 {
 id: '3',
 title: 'تتبع طلبك بسهولة',
 description: 'تابع حالة طلبك خطوة بخطوة من التطبيق، وتواصل مع الفني مباشرة في أي وقت.',
 icon: 'map-pin' as const,
 },
];

export default function OnboardingScreen() {
 const [currentIndex, setCurrentIndex] = useState(0);
 const scrollRef = useRef<ScrollView>(null);
 const { width } = useWindowDimensions();

 const completeOnboarding = async () => {
 try {
 await AsyncStorage.setItem('@has_seen_onboarding', 'true');
 router.replace('/login');
 } catch (e) {
 console.error(e);
 router.replace('/login');
 }
 };

 const handleNext = () => {
 if (currentIndex < ONBOARDING_DATA.length - 1) {
 const nextIndex = currentIndex + 1;
 const xOffset = I18nManager.isRTL ? -nextIndex * width : nextIndex * width;
 scrollRef.current?.scrollTo({ x: xOffset, animated: true });
 setCurrentIndex(nextIndex);
 } else {
 completeOnboarding();
 }
 };

 const handleScroll = (event: any) => {
 const offsetX = event.nativeEvent.contentOffset.x;
 // Handle RTL offset calculation properly
 const newIndex = Math.round(Math.abs(offsetX) / width);
 if (newIndex !== currentIndex && newIndex >= 0 && newIndex < ONBOARDING_DATA.length) {
 setCurrentIndex(newIndex);
 }
 };

 return (
 <View className="flex-1 bg-surface relative">
 {/* Skip Button */}
 <View className="absolute top-12 left-margin-mobile z-50">
 <Pressable onPress={completeOnboarding} className="px-4 py-2">
 <Text className="font-label-md text-[14px] text-on-surface-variant">تخطي</Text>
 </Pressable>
 </View>

 <ScrollView
 ref={scrollRef}
 horizontal
 pagingEnabled
 showsHorizontalScrollIndicator={false}
 onMomentumScrollEnd={handleScroll}
 className="flex-1"
 // In React Native, `inverted` isn't natively supported for ScrollView exactly like FlatList,
 // but RTL layouts naturally handle horizontal scrolling from right to left.
 >
 {ONBOARDING_DATA.map((item, index) => (
 <View key={item.id} style={{ width }} className="flex-1 items-center justify-center px-8">
 <Animated.View 
 entering={FadeInDown.delay(index * 100).springify()}
 className="w-48 h-48 bg-primary-container rounded-full items-center justify-center mb-12 shadow-soft"
 >
 <Feather name={item.icon} size={80} color="#00685f" />
 </Animated.View>

 <Animated.View entering={SlideInRight.delay(200).springify()}>
 <Text className="font-title-lg text-[28px] font-bold text-on-surface text-center mb-4">
 {item.title}
 </Text>
 </Animated.View>

 <Animated.View entering={FadeIn.delay(400).springify()}>
 <Text className="font-body-lg text-[16px] leading-relaxed text-on-surface-variant text-center px-4">
 {item.description}
 </Text>
 </Animated.View>
 </View>
 ))}
 </ScrollView>

 {/* Bottom Controls */}
 <View className="px-margin-mobile pb-12 pt-6">
 {/* Indicators */}
 <View className="flex-row-reverse justify-center items-center gap-2 mb-8">
 {ONBOARDING_DATA.map((_, idx) => (
 <View
 key={idx}
 className={`h-2 rounded-full ${
 idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-surface-container-highest'
 }`}
 />
 ))}
 </View>

 <AppButton 
 label={currentIndex === ONBOARDING_DATA.length - 1 ? "ابدأ الآن" : "التالي"} 
 onPress={handleNext} 
 variant="primary" 
 size="lg"
 />
 </View>
 </View>
 );
}
