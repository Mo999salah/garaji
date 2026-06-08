import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import type { RequestReview } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppText as Text } from '@/shared/components/AppText';
import { SectionHeader } from '@/shared/components/OperationalUI';

interface RequestReviewSectionProps {
  review: RequestReview | null | undefined;
  isSaving: boolean;
  onSubmit: (values: { rating: number; comment: string }) => Promise<void>;
}

export function RequestReviewSection({ isSaving, onSubmit, review }: RequestReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  return (
    <AppCard tone="quiet">
      <SectionHeader subtitle="تقييمك يساعد الورشة على تحسين الخدمة." title="تقييم الخدمة" />
      <View className="mt-4 gap-3">
        {review ? (
          <View className="rounded-lg border border-line bg-white p-4 dark:border-dark-line dark:bg-dark-card">
            <Text className="font-sans text-right text-xl font-black text-action-700 dark:text-emerald-300">
              {review.rating.toLocaleString('ar-SA')} / ٥
            </Text>
            {review.comment ? (
              <Text className="font-sans mt-2 text-right text-sm text-muted dark:text-dark-muted">
                {review.comment}
              </Text>
            ) : null}
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row-reverse gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  className={`h-11 flex-1 items-center justify-center rounded-md border ${
                    value <= rating
                      ? 'border-brand-600 bg-brand-600 dark:border-dark-brand-500 dark:bg-dark-brand-500'
                      : 'border-line bg-white dark:border-dark-line dark:bg-dark-card'
                  }`}
                  key={value}
                  onPress={() => setRating(value)}
                >
                  <Text
                    className={`font-sans font-black ${
                      value <= rating
                        ? 'text-white dark:text-[#071016]'
                        : 'text-muted dark:text-dark-muted'
                    }`}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              className="min-h-24 rounded-lg border border-line bg-white p-3 text-right font-sans text-sm text-ink dark:border-dark-line dark:bg-dark-card dark:text-dark-ink"
              multiline
              onChangeText={setReviewComment}
              placeholder="اكتب ملاحظتك..."
              placeholderTextColor="#64748B"
              textAlign="right"
              value={reviewComment}
            />
            <AppButton
              loading={isSaving}
              onPress={() => onSubmit({ rating, comment: reviewComment })}
            >
              حفظ التقييم
            </AppButton>
          </View>
        )}
      </View>
    </AppCard>
  );
}
