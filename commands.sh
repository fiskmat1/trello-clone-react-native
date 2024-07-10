npx create-expo-app trelloClone -t default
npx expo install expo-dev-client
npx expo prebuild

npm install @clerk/clerk-expo
npx expo install expo-secure-store
npx expo install @supabase/supabase-js

npx expo install @expo/react-native-action-sheet
npx expo install expo-web-browser
npm add @gorhom/bottom-sheet@^4

supabase init
supabase link --project-ref
supabase functions new create-user
supabase functions deploy --no-verify-jwt

npm add zeego react-native-ios-context-menu react-native-ios-utilities @react-native-menu/menu

npx expo install expo-blur

npx expo install react-native-reanimated-carousel