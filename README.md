# CinePalm

CinePalm is a React Native (Expo) app with TMDB integration and an IMDb-inspired black/yellow theme.

## Features
- TMDB-backed Home lists with pagination
- Movie detail screen with ratings, genres, and overview
- Debounced search
- Persistent favorites (AsyncStorage)
- Loading, error, and empty states

## Repository
https://github.com/OzanDuru/CinePalm

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ (ships with Node)
- Expo Go app (for running on a physical device)
- Xcode (for iOS simulator) or Android Studio (for Android emulator), if needed

## Quick Start (Terminal)
```bash
npm install
# create a local .env with the required EXPO_PUBLIC_* keys (see Setup)
npm run start
```

## Full Setup (Terminal)
```bash
git clone https://github.com/OzanDuru/CinePalm.git
cd CinePalm
npm install
# create a local .env with the required EXPO_PUBLIC_* keys (see Environment Variables)
npm run start
```

## Setup
1) Install dependencies:
   ```bash
   npm install
   ```
2) Create a local `.env` (do not commit it):
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://api.themoviedb.org/3
   EXPO_PUBLIC_API_KEY=YOUR_TMDB_API_KEY
   EXPO_PUBLIC_API_READ_TOKEN=YOUR_TMDB_READ_TOKEN
   ```
   You can get your TMDB API key and read token from your TMDB account.
3) (Optional) Firebase setup:
   - The app uses Firebase Auth and Firestore.
   - If you want to use your own Firebase project, update `src/firebase/firebase.js`.

## Environment Variables
- `EXPO_PUBLIC_API_BASE_URL`: TMDB API base URL.
- `EXPO_PUBLIC_API_KEY`: TMDB API key for v3 requests.
- `EXPO_PUBLIC_API_READ_TOKEN`: TMDB read access token for v4 requests.

## Package Installation
- Install all existing dependencies:
  ```bash
  npm install
  ```
- Add a new dependency (Expo-compatible):
  ```bash
  npx expo install <package-name>
  ```
- Add a plain JS dependency:
  ```bash
  npm install <package-name>
  ```

## Main Dependencies
- `expo`: Expo runtime and tooling.
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`: Navigation stack and tabs.
- `firebase`: Auth and Firestore.
- `@react-native-async-storage/async-storage`: Local persistence for favorites.
- `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`, `react-native-safe-area-context`: Navigation and UI primitives.
- `@expo/vector-icons`: Ionicons used in the tab bar.
- `react-native-webview`, `react-native-youtube-iframe`: Media and web content.

## Project Structure
```text
.
├── App.js                 # App entry, navigation, auth gating
├── index.js               # Expo entry point
├── app.json               # Expo config
├── assets/                # Images and static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens (Home, Search, Detail, etc.)
│   ├── services/          # TMDB API client and helpers
│   ├── firebase/          # Firebase init and auth context
│   ├── theme/             # Colors, typography, spacing
│   ├── utils/             # Storage helpers (favorites, etc.)
│   ├── constants/         # Shared constants
│   └── config/            # Env validation and config
└── package.json           # Scripts and dependencies
```

## Key Paths
- `App.js`: Navigation stacks, tabs, and auth gate.
- `src/services/tmdbClient.js`: Validates env and calls TMDB APIs.
- `src/services/tmdb.js`: TMDB endpoints and helpers.
- `src/firebase/firebase.js`: Firebase config and initialization.
- `src/screens/`: All app screens and feature flows.
- `src/utils/`: AsyncStorage utilities for favorites.

## Run
- Start the Expo dev server:
  ```bash
  npm run start
  ```
- Run on Android emulator:
  ```bash
  npm run android
  ```
- Run on iOS simulator:
  ```bash
  npm run ios
  ```
- Run on web:
  ```bash
  npm run web
  ```

## Running on a Device or Simulator
- Physical device:
  1) Install Expo Go from the App Store or Google Play.
  2) Run `npm run start`.
  3) Scan the QR code with Expo Go.
- iOS Simulator:
  - Install Xcode and open the iOS Simulator.
  - Run `npm run ios`.
- Android Emulator:
  - Install Android Studio and create an emulator.
  - Run `npm run android`.

## Common Terminal Commands
- Install dependencies:
  ```bash
  npm install
  ```
- Clear Metro cache if the bundler gets stuck:
  ```bash
  npx expo start -c
  ```
- Reinstall modules if you hit dependency issues:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Notes
- Do not commit `.env` or any secrets.
- The app reads config only from the `EXPO_PUBLIC_*` env keys above.

## Authors
- Ozan Duru (Student No: 210408005)
- Zerrin Yaşik (Student No: 210408008)
