import { useFonts } from 'expo-font';
import { type TextStyle } from 'react-native';

export const appFontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  bold: 'Pretendard-Bold',
} as const satisfies Record<string, NonNullable<TextStyle['fontFamily']>>;

export function useAppFonts() {
  const [loaded, error] = useFonts({
    [appFontFamily.regular]: require('../../assets/fonts/Pretendard-Regular.otf'),
    [appFontFamily.medium]: require('../../assets/fonts/Pretendard-Medium.otf'),
    [appFontFamily.bold]: require('../../assets/fonts/Pretendard-Bold.otf'),
  });

  return {
    fontsLoaded: loaded || Boolean(error),
    fontFamily: appFontFamily,
  };
}
