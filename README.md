# 역검

Expo app reset for a fresh rebuild while preserving the existing store identifiers.

## Development

```sh
npm install
npm start
```

## Environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not put Supabase service role or secret keys in Expo public environment variables.

## Native data stack

- Local DB: `expo-sqlite`
- Auth session storage: `expo-secure-store`
- Backend client: `@supabase/supabase-js`
- Server state: `@tanstack/react-query`
- Client state: `zustand`
- Animation: `react-native-reanimated` + `react-native-worklets`
- Canvas graphics: `@shopify/react-native-skia`

Expo SDK 56 configures the Reanimated/Worklets Babel plugin through `babel-preset-expo`, so this project does not need a custom `babel.config.js` for Reanimated.

## Preserved app identifiers

- iOS bundle identifier: `com.bongsub.aiaptitudegames`
- Android package: `com.bongsub.aiaptitudegames`
- Expo slug: `ai-aptitude-games`
- URL scheme: `aiaptitudegames`
- EAS project ID: `a00249ab-13c4-4a37-ad29-3bf408d2e3cc`
