import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...props }: AppInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        className={`min-h-12 rounded-lg border bg-white px-4 text-base text-ink ${
          error ? 'border-red-500' : 'border-line'
        }`}
        placeholderTextColor="#8B9692"
        textAlign={props.textAlign}
        {...props}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
