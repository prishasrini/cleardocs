# ClearDocs app

React Native + Expo SDK 58 + Expo Router + TypeScript.

## Run it on your phone

1. Start the backend first (see `../backend/README.md`).
2. Install **Expo Go** from the Play Store or App Store.
3. In this folder:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).

Your phone and laptop must be on the **same Wi-Fi**. The app works out the backend address automatically from the Expo dev server (your laptop's IP, port 5000). You can see which address it's using on the Profile tab.

If your Wi-Fi blocks devices from talking to each other (common on college Wi-Fi), use your phone's hotspot for both, or set the address yourself:
```bash
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://192.168.1.23:5000
```

Press `w` in the terminal to open the app in a browser instead.

## Screens

| Screen | File | What it does |
|---|---|---|
| Sign in / Sign up | `src/app/sign-in.tsx`, `sign-up.tsx` | Animated stamp header, form validation, server errors |
| Services | `src/app/(app)/(tabs)/index.tsx` | Services from the API, cards slide in, pull to refresh |
| New request | `src/app/(app)/service/[slug].tsx` | Pick up to 5 files, remove them, add notes, upload |
| My requests | `src/app/(app)/(tabs)/requests.tsx` | Your requests with status badges, reloads when you come back to it |
| Request | `src/app/(app)/request/[id].tsx` | Animated timeline, open files, and for admins, change the status |
| Admin | `src/app/(app)/(tabs)/admin.tsx` | All requests, filter by status. Only visible to admins |
| Profile | `src/app/(app)/(tabs)/profile.tsx` | Account details, log out |

## How it works

- **Navigation:** Expo Router. Files in `src/app` are screens; `_layout.tsx` files set up the stacks and tabs.
- **Login:** `src/lib/auth.tsx` keeps the user and token in React context. The token is saved in **SecureStore** (the phone's encrypted storage). The root layout uses `Stack.Protected` so logged-out users only see sign in/up and logged-in users only see the app. No manual redirects needed.
- **API calls:** all in `src/lib/api.ts`, with one `request()` helper that adds the token and turns errors into readable messages.
- **Uploads:** `expo-document-picker` picks files; they're sent as `multipart/form-data` like a browser form.
- **Private files:** tapping a document asks the API for a signed link that works for 5 minutes, then opens it, so the login token never goes in a URL.
- **Animations:** `react-native-reanimated` for list entrances, the timeline dots and lines, and the sign-in stamp.

## Checks

```bash
npx tsc --noEmit   # type check
npx eslint src     # lint
```

## Build an APK to share

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
EAS builds in the cloud and gives you a download link for the APK. Set `EXPO_PUBLIC_API_URL` to your deployed backend first (see `../DEPLOY.md`), because an installed APK can't use your laptop's dev server.
