import { Text, TextInput } from 'react-native';
import type { TextInputProps, TextProps, TextStyle } from 'react-native';

type ComponentWithDefaultProps<T> = {
 defaultProps?: T;
};

export const appFontMap = {
 Tajawal: require('../../../assets/fonts/Tajawal-Regular.ttf'),
 Tajawal_400Regular: require('../../../assets/fonts/Tajawal-Regular.ttf'),
 Tajawal_500Medium: require('../../../assets/fonts/Tajawal-Medium.ttf'),
 Tajawal_700Bold: require('../../../assets/fonts/Tajawal-Bold.ttf'),
 Tajawal_800ExtraBold: require('../../../assets/fonts/Tajawal-ExtraBold.ttf'),
 Tajawal_900Black: require('../../../assets/fonts/Tajawal-Black.ttf'),
};

export const defaultArabicFontFamily = 'Tajawal';

let defaultFontsConfigured = false;

export function configureDefaultFonts() {
 if (defaultFontsConfigured) {
 return;
 }

 defaultFontsConfigured = true;

 const defaultFontStyle: TextStyle = {
 fontFamily: defaultArabicFontFamily,
 };

 const text = Text as unknown as ComponentWithDefaultProps<TextProps>;
 text.defaultProps = text.defaultProps ?? {};
 text.defaultProps.style = [defaultFontStyle, text.defaultProps.style];

 const textInput = TextInput as unknown as ComponentWithDefaultProps<TextInputProps>;
 textInput.defaultProps = textInput.defaultProps ?? {};
 textInput.defaultProps.style = [defaultFontStyle, textInput.defaultProps.style];
}
