import { useState } from 'react';
import { View } from 'react-native';

import type { RequestMessage } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionHeader } from '@/shared/components/OperationalUI';

import { formatOperationsDate } from './operationsFormatters';

interface RequestMessagesSectionProps {
 customerId: string;
 isMerchant: boolean;
 messages: RequestMessage[];
 isSending: boolean;
 onSend: (body: string) => Promise<void>;
}

export function RequestMessagesSection({
 customerId,
 isMerchant,
 isSending,
 messages,
 onSend,
}: RequestMessagesSectionProps) {
 const [messageBody, setMessageBody] = useState('');

 const handleSend = async () => {
 await onSend(messageBody);
 setMessageBody('');
 };

 return (
 <AppCard tone="quiet">
 <SectionHeader
 subtitle="تواصل داخل الطلب بدل ضياع التفاصيل خارج التطبيق."
 title="رسائل الطلب"
 />
 <View className="mt-4 gap-3">
 {messages.length ? (
 messages.map((message) => {
 const own = message.senderId === (isMerchant ? undefined : customerId);
 return (
 <View
 className={`rounded-lg border p-3 ${
 own
 ? 'border-brand-600 bg-primary'
 : 'border-outline-variant bg-white '
 }`}
 key={message.id}
 >
 <Text
 className={`font-sans text-right text-sm leading-6 ${
 own ? 'text-white' : 'text-on-surface '
 }`}
 >
 {message.body}
 </Text>
 <Text className="font-sans mt-1 text-right text-[11px] text-on-surface-variant">
 {formatOperationsDate(message.createdAt)}
 </Text>
 </View>
 );
 })
 ) : (
 <EmptyState message="لا توجد رسائل بعد." title="المحادثة فارغة" />
 )}

 <AppInput
 label="رسالة جديدة"
 multiline
 numberOfLines={3}
 onChangeText={setMessageBody}
 placeholder="اكتب تحديثاً أو سؤالاً..."
 textAlign="right"
 value={messageBody}
 />
 <AppButton
 disabled={!messageBody.trim()}
 loading={isSending}
 onPress={handleSend}
 >
 إرسال الرسالة
 </AppButton>
 </View>
 </AppCard>
 );
}
