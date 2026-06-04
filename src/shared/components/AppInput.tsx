import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  trailing?: ReactNode;
}

export function AppInput({
  label,
  error,
  containerClassName = '',
  inputClassName = '',
  trailing,
  ...props
}: AppInputProps) {
  return (
    <View className={`gap-2 ${containerClassName}`}>
      <Text className="text-sm font-semibold text-ink">{label}</Text>
      <View className="relative">
        <TextInput
          className={`min-h-12 rounded-lg border bg-white px-4 text-base text-ink ${
            trailing ? 'pl-20' : ''
          } ${error ? 'border-red-500' : 'border-line'} ${inputClassName}`}
          placeholderTextColor="#8B9692"
          textAlign={props.textAlign}
          {...props}
        />
        {trailing ? (
          <View className="absolute bottom-0 left-3 top-0 justify-center">{trailing}</View>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
