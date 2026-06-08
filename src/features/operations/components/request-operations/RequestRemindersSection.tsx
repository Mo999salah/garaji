import { useState } from 'react';
import { Alert, View } from 'react-native';

import type { ServiceReminder } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionHeader } from '@/shared/components/OperationalUI';

import { formatOperationsDate } from './operationsFormatters';

interface RequestRemindersSectionProps {
  reminders: ServiceReminder[];
  isSaving: boolean;
  onSchedule: (values: { remindAt: string; body: string }) => Promise<void>;
}

export function RequestRemindersSection({
  isSaving,
  onSchedule,
  reminders,
}: RequestRemindersSectionProps) {
  const [reminderAt, setReminderAt] = useState('');
  const [reminderBody, setReminderBody] = useState('');

  const handleSchedule = async () => {
    if (!reminderAt || Number.isNaN(Date.parse(reminderAt))) {
      Alert.alert('تنبيه', 'اكتب وقت التذكير بصيغة صحيحة مثل 2026-06-07T08:00:00.');
      return;
    }

    await onSchedule({ remindAt: reminderAt, body: reminderBody });
    setReminderAt('');
    setReminderBody('');
  };

  return (
    <AppCard tone="quiet">
      <SectionHeader
        subtitle="تذكيرات مرتبطة بالطلب، مثل قبل الموعد أو المتابعة بعد الإنجاز."
        title="التذكيرات"
      />
      <View className="mt-4 gap-3">
        {reminders.length ? (
          reminders.map((reminder) => (
            <View
              className="rounded-lg border border-line bg-white p-3 dark:border-dark-line dark:bg-dark-card"
              key={reminder.id}
            >
              <Text className="font-sans text-right text-sm font-bold text-ink dark:text-dark-ink">
                {reminder.title}
              </Text>
              <Text className="font-sans mt-1 text-right text-xs text-muted dark:text-dark-muted">
                {formatOperationsDate(reminder.remindAt)} · {reminder.status}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState message="لا توجد تذكيرات لهذا الطلب." title="بدون تذكيرات" />
        )}
        <AppInput
          label="وقت التذكير"
          onChangeText={setReminderAt}
          placeholder="2026-06-07T08:00:00"
          textAlign="right"
          value={reminderAt}
        />
        <AppInput
          label="نص التذكير"
          multiline
          numberOfLines={2}
          onChangeText={setReminderBody}
          placeholder="رسالة مختصرة للعميل..."
          textAlign="right"
          value={reminderBody}
        />
        <AppButton loading={isSaving} onPress={handleSchedule}>
          جدولة تذكير
        </AppButton>
      </View>
    </AppCard>
  );
}
