import { useState } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, withSpring } from 'react-native-reanimated';

import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppText as Text } from '@/shared/components/AppText';
import { AppButton } from '@/shared/components/AppButton';
import { AppColors } from '@/shared/lib/colors';

function StarRating({ rating, setRating }: { rating: number; setRating: (val: number) => void }) {
 return (
 <View className="flex-row-reverse justify-center items-center gap-2 my-8">
 {[1, 2, 3, 4, 5].map((star) => (
 <AnimatedPressable
            key={star}
            onPress={() => setRating(star)}
            accessibilityLabel={`${star} من 5 نجوم`}
            accessibilityRole="radio"
            accessibilityState={{ selected: star <= rating }}
            className="p-2 min-w-11 min-h-11 items-center justify-center"
          >
            <AnimatedStar isSelected={star <= rating} />
          </AnimatedPressable>
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
          color={isSelected ? AppColors.warning : AppColors.outlineVariant}
        />
 </Animated.View>
 );
}

export default function RateServiceScreen() {
  const [rating, setRating] = useState(0);
 const [comment, setComment] = useState('');

  const handleSubmit = async () => {
 // TODO: wire to real review API when available
 Alert.alert('قريباً', 'سيتوفر حفظ التقييم قريباً.');
 };

 return (
 <View className="flex-1 bg-surface">
 {/* Top App Bar */}
 <View className="bg-surface shadow-soft flex-row-reverse justify-between items-center px-margin-mobile py-4 z-50">
 <View className="w-10 h-10" />
 <Text className="font-title-md text-title-md text-primary flex-1 text-center font-bold">تقييم الخدمة</Text>
  <AnimatedPressable
        onPress={() => router.back()}
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
        className="w-10 h-10 flex items-center justify-center rounded-full"
      >
        <MaterialIcons name="close" size={24} color={AppColors.onSurface} />
      </AnimatedPressable>
 </View>

 <ScrollView 
 contentContainerClassName="px-margin-mobile pt-stack-md flex-col pb-32"
 showsVerticalScrollIndicator={false}
 >
 <Animated.View entering={FadeInUp.delay(100).springify()} className="items-center mt-4">
  <View className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center mb-6">
  <MaterialIcons name="thumb-up" size={40} color={AppColors.onSecondaryContainer} />
  </View>
  <Text className="text-title-lg font-bold text-on-surface text-center mb-2">
  كيف كانت تجربتك؟
  </Text>
  <Text className="text-body-md text-on-surface-variant text-center opacity-80 px-4">
 رأيك يهمنا ويساعدنا في تحسين جودة خدماتنا بشكل مستمر.
 </Text>

 <StarRating rating={rating} setRating={setRating} />
 </Animated.View>

 <Animated.View entering={FadeInUp.delay(200).springify()} className="mt-2">
  <Text className="text-title-md font-bold text-on-surface text-right mb-3">
  هل لديك ملاحظات إضافية؟
  </Text>
  <View className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 h-32">
  <TextInput
            className="flex-1 text-body-md text-on-surface text-right"
            placeholder="اكتب ملاحظاتك هنا..."
            placeholderTextColor={AppColors.outlineVariant}
            multiline
            textAlign="right"
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            accessibilityLabel="ملاحظات إضافية"
            accessibilityRole="text"
          />
  </View>
 </Animated.View>

 </ScrollView>

 {/* Bottom Button */}
 <View className="absolute bottom-0 w-full bg-surface p-margin-mobile border-t border-surface-container-highest">
  <AppButton
          label="إرسال التقييم (قريباً)"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          disabled={true}
          accessibilityLabel="إرسال التقييم - غير متاح حالياً"
        />
 </View>
 </View>
 );
}
