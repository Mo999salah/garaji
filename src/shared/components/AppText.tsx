import { Text as NativeText } from "react-native";
import type { TextProps, TextStyle } from "react-native";

const fontByClassName = [
  { pattern: /\bfont-black\b/, family: "Tajawal_900Black" },
  { pattern: /\bfont-extrabold\b/, family: "Tajawal_800ExtraBold" },
  { pattern: /\bfont-bold\b/, family: "Tajawal_700Bold" },
  { pattern: /\bfont-semibold\b/, family: "Tajawal_500Medium" },
  { pattern: /\bfont-medium\b/, family: "Tajawal_500Medium" },
];

function resolveFontFamily(className?: string) {
  if (!className || /\bfont-mono\b/.test(className)) {
    return undefined;
  }

  return (
    fontByClassName.find(({ pattern }) => pattern.test(className))?.family ??
    "Tajawal_400Regular"
  );
}

export function AppText({
  className,
  style,
  ...props
}: TextProps & { className?: string }) {
  const fontFamily = resolveFontFamily(className);
  const fontStyle: TextStyle | undefined = fontFamily
    ? { fontFamily }
    : undefined;

  return (
    <NativeText {...props} className={className} style={[style, fontStyle]} />
  );
}
