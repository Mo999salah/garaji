import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import type { InvoiceItem } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionHeader } from '@/shared/components/OperationalUI';

import { formatMoney } from './operationsFormatters';

interface RequestInvoiceSectionProps {
  invoiceItems: InvoiceItem[];
  isMerchant: boolean;
  isSaving: boolean;
  onAddItem: (values: {
    description: string;
    quantity: number;
    unitPrice: number;
  }) => Promise<void>;
}

export function RequestInvoiceSection({
  invoiceItems,
  isMerchant,
  isSaving,
  onAddItem,
}: RequestInvoiceSectionProps) {
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [invoiceQuantity, setInvoiceQuantity] = useState('1');
  const [invoiceUnitPrice, setInvoiceUnitPrice] = useState('');

  const invoiceTotal = useMemo(
    () => invoiceItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [invoiceItems],
  );

  const handleAddItem = async () => {
    if (!invoiceDescription.trim() || Number(invoiceUnitPrice) < 0) {
      Alert.alert('تنبيه', 'أدخل وصف البند وسعره بشكل صحيح.');
      return;
    }

    await onAddItem({
      description: invoiceDescription,
      quantity: Number(invoiceQuantity || 1),
      unitPrice: Number(invoiceUnitPrice || 0),
    });
    setInvoiceDescription('');
    setInvoiceQuantity('1');
    setInvoiceUnitPrice('');
  };

  return (
    <AppCard tone="quiet">
      <SectionHeader
        subtitle="بنود العمل والقطع تظهر للعميل كسعر نهائي واضح."
        title="الفاتورة"
      />
      <View className="mt-4 gap-3">
        {invoiceItems.length ? (
          invoiceItems.map((item) => (
            <View
              className="flex-row-reverse items-center justify-between rounded-lg border border-line bg-white p-3 dark:border-dark-line dark:bg-dark-card"
              key={item.id}
            >
              <View className="flex-1 items-end">
                <Text className="font-sans text-right text-sm font-bold text-ink dark:text-dark-ink">
                  {item.description}
                </Text>
                <Text className="font-sans text-right text-xs text-muted dark:text-dark-muted">
                  {item.quantity.toLocaleString('ar-SA')} × {formatMoney(item.unitPrice)}
                </Text>
              </View>
              <Text className="font-sans text-sm font-black text-ink dark:text-dark-ink">
                {formatMoney(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState message="لم تتم إضافة بنود فاتورة بعد." title="الفاتورة فارغة" />
        )}
        <View className="flex-row-reverse items-center justify-between border-t border-line pt-3 dark:border-dark-line">
          <Text className="font-sans text-sm font-bold text-muted dark:text-dark-muted">
            الإجمالي
          </Text>
          <Text className="font-sans text-xl font-black text-action-700 dark:text-emerald-300">
            {formatMoney(invoiceTotal)}
          </Text>
        </View>

        {isMerchant ? (
          <View className="gap-3 border-t border-line pt-4 dark:border-dark-line">
            <AppInput
              label="وصف البند"
              onChangeText={setInvoiceDescription}
              placeholder="مثال: فلتر زيت"
              textAlign="right"
              value={invoiceDescription}
            />
            <View className="flex-row-reverse gap-3">
              <View className="flex-1">
                <AppInput
                  keyboardType="decimal-pad"
                  label="الكمية"
                  onChangeText={setInvoiceQuantity}
                  textAlign="right"
                  value={invoiceQuantity}
                />
              </View>
              <View className="flex-1">
                <AppInput
                  keyboardType="decimal-pad"
                  label="السعر"
                  onChangeText={setInvoiceUnitPrice}
                  textAlign="right"
                  value={invoiceUnitPrice}
                />
              </View>
            </View>
            <AppButton loading={isSaving} onPress={handleAddItem}>
              إضافة بند
            </AppButton>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
