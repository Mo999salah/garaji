import { Text, View } from 'react-native';

import {
  formatCurrency,
  getCartItemSubtotal,
} from '@/features/cart/selectors/cartSelectors';
import type { CartItem } from '@/features/cart/types';
import { AppButton } from '@/shared/components/AppButton';

interface CartItemRowProps {
  item: CartItem;
  availabilityMessage?: string | null;
  disableIncrease?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  availabilityMessage,
  disableIncrease,
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemRowProps) {
  return (
    <View className="rounded-lg border border-line bg-white p-4">
      <View className="gap-1">
        <Text className="text-xs font-semibold uppercase text-muted">{item.brand}</Text>
        <Text className="text-lg font-bold leading-6 text-ink">{item.name}</Text>
        {item.partNumber ? (
          <Text className="text-xs font-semibold uppercase text-brand-700">{item.partNumber}</Text>
        ) : null}
        <Text className="text-sm text-muted">
          {formatCurrency(item.unitPrice)} / {item.unit}
        </Text>
        <Text className="text-xs text-muted">Minimum order {item.minOrderQuantity}</Text>
        {typeof item.stockQuantity === 'number' ? (
          <Text className="text-xs text-muted">Available stock {item.stockQuantity}</Text>
        ) : null}
        {availabilityMessage ? (
          <Text className="text-sm font-semibold text-red-600">{availabilityMessage}</Text>
        ) : null}
      </View>

      <View className="mt-4 flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <AppButton accessibilityLabel={`Decrease ${item.name}`} onPress={onDecrease} variant="secondary">
            -
          </AppButton>
          <View className="min-h-12 min-w-14 items-center justify-center rounded-lg border border-line bg-surface px-3">
            <Text className="text-base font-bold text-ink">{item.quantity}</Text>
          </View>
          <AppButton
            accessibilityLabel={`Increase ${item.name}`}
            disabled={disableIncrease}
            onPress={onIncrease}
            variant="secondary"
          >
            +
          </AppButton>
        </View>

        <Text className="text-lg font-bold text-brand-700">
          {formatCurrency(getCartItemSubtotal(item))}
        </Text>
      </View>

      <View className="mt-3">
        <AppButton accessibilityLabel={`Remove ${item.name}`} onPress={onRemove} variant="ghost">
          Remove
        </AppButton>
      </View>
    </View>
  );
}
