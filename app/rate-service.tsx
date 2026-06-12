import { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText as Text } from '@/shared/components/AppText';
import { AppButton } from '@/shared/components/AppButton';

function StarRating({ rating, setRating }: { rating: number; setRating: (val: number) => void }) {
 return (
 <View className="flex-row-reverse justify-center items-center gap-2 my-8">
 {[1, 2, 3, 4, 5].map((star) => (
 <Pressable 
 key={star} 
 onPress={() => setRating(star)}
 className="p-2"
 >
 <AnimatedStar isSelected={star <= rating} />
 </Pressable>
 ))}
 </View>
 );
}

function AnimatedStar({ isSelected }: { isSelected: boolean }) {
 
 return (
 <Animated.View
 style={{
 transform: [{ scale: isSelected ? withSpring(1.2) : withSpring(1) }]
 }}
 >
 <MaterialIcons 
 name={isSelected ? "star" : "star-border"} 
 size={40} 
 color={isSelected ? "#FFB800" : "#bcc9c6"} 
 />
 </Animated.View>
 );
}

export default function RateServiceScreen() {
  const [rating, setRating] = useState(0);
 const [comment, setComment] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async () => {
 if (rating === 0) {
 Alert.alert('تنبيه', 'الرجاء اختيار تقييم قبل الإرسال.');
 return;
 }

 setIsSubmitting(true);
 // Simulate API call
 setTimeout(() => {
 setIsSubmitting(false);
 Alert.alert('شكراً لك!', 'تم استلام تقييمك بنجاح، ونتمنى خدمتك دائماً بأفضل شكل.', [
 { text: 'حسناً', onPress: () => router.back() }
 ]);
 }, 1500);
 };

 return (
 <View className="flex-1 bg-surface">
 {/* Top App Bar */}
 <View className="bg-surface shadow-soft flex-row-reverse justify-between items-center px-margin-mobile py-4 z-50">
 <View className="w-10 h-10" />
 <Text className="font-title-md text-title-md text-primary flex-1 text-center font-bold">تقييم الخدمة</Text>
 <Pressable onPress={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high">
 <MaterialIcons name="close" size={24} color="#1a1c1d" />
 </Pressable>
 </View>

 <ScrollView 
 contentContainerClassName="px-margin-mobile pt-stack-md flex-col pb-32"
 showsVerticalScrollIndicator={false}
 >
 <Animated.View entering={FadeInUp.delay(100).springify()} className="items-center mt-4">
 <View className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-6">
 <MaterialIcons name="thumb-up" size={40} color="#00685f" />
 </View>
 <Text className="font-title-lg text-title-lg font-bold text-on-surface text-center mb-2">
 كيف كانت تجربتك؟
 </Text>
 <Text className="font-body-md text-[16px] text-on-surface-variant text-center opacity-80 px-4">
 رأيك يهمنا ويساعدنا في تحسين جودة خدماتنا بشكل مستمر.
 </Text>

 <StarRating rating={rating} setRating={setRating} />
 </Animated.View>

 <Animated.View entering={FadeInUp.delay(200).springify()} className="mt-2">
 <Text className="font-title-md text-[16px] font-bold text-on-surface text-right mb-3">
 هل لديك ملاحظات إضافية؟
 </Text>
 <View className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 h-32">
 <TextInput
 className="flex-1 font-body-md text-[16px] text-on-surface text-right"
 placeholder="اكتب ملاحظاتك هنا..."
 placeholderTextColor="#bcc9c6"
 multiline
 textAlign="right"
 textAlignVertical="top"
 value={comment}
 onChangeText={setComment}
 />
 </View>
 </Animated.View>

 </ScrollView>

 {/* Bottom Button */}
 <View className="absolute bottom-0 w-full bg-surface p-margin-mobile border-t border-surface-container-highest">
 <AppButton 
 label="إرسال التقييم" 
 onPress={handleSubmit} 
 variant="primary" 
 size="lg"
 loading={isSubmitting}
 />
 </View>
 </View>
 );
}
