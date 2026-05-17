# Kushi Expo App

A comprehensive mobile application built with React Native and Expo, serving as a platform for hosting and guest services. It features real-time communication, secure payments, KYC verification, and booking management.

## Project Overview

- **Framework:** Expo (SDK 54) with Expo Router (file-based navigation).
- **New Architecture:** Enabled (`newArchEnabled: true`).
- **React Compiler:** Enabled (`reactCompiler: true`).
- **Language:** TypeScript (React 19).
- **Styling:** NativeWind (TailwindCSS for React Native) and React Native Paper.
- **API Layer:** GraphQL via Urql, with TanStack Query for caching and asynchronous state management.
- **State Management:** Zustand (with persistence via AsyncStorage).
- **Real-time Communication:** Daily.co for video/audio calls and WebRTC.
- **Push Notifications:** Firebase Cloud Messaging (FCM) and Notifee.
- **Authentication:** Google Sign-In, Apple Authentication, and OTP-based verification.
- **Payments:** Flutterwave integration.
- **VoIP & Calling:** `react-native-callkeep` and VoIP push notifications.
- **Advanced Media:** `react-native-vision-camera` for face detection and advanced camera features.

## Project Structure

- `app/`: Main application routing logic using Expo Router.
  - `auth/`: Authentication flow (Sign-in, Sign-up, OTP, Reset password).
  - `onboarding/`: Initial walkthrough and get started flow.
  - `guest/`: Guest-facing interface (Home, Chat, Profile, Saved listings).
  - `host/`: Host-facing interface (Analytics, Listings, Profile, Chat).
  - `kyc/`: Identity verification flow (BVN, NIN, Image).
  - `bookings/`, `chats/`, `hostings/`, `users/`: Feature-specific modules.
  - `camera.tsx`, `photo-gallery.tsx`: Shared media capture and selection screens.
- `components/`: UI components following Atomic Design principles.
  - `atoms/`: Basic building blocks (Prefix: `a-`, e.g., `a-button.tsx`).
  - `molecules/`: Composite components (Prefix: `m-`, e.g., `m-booking-card.tsx`).
  - `organisms/`: Complex UI sections (Prefix: `o-`, e.g., `o-chat-input.tsx`).
  - `providers/`: Context providers (GraphQL, TanStack, Paper, Keyboard, etc.).
  - `ui/`: Base UI symbols and primitive icons.
- `lib/`: Core application logic.
  - `hooks/`: Custom React hooks (e.g., `useUser`, `call`, `camera`).
  - `services/`: External service integrations (GraphQL, Urql).
  - `stores/`: Zustand store definitions for global state.
  - `utils/`: Helper functions (Auth, Notifications, Call, Time, etc.).
  - `plugins/`: Custom Expo Config Plugins (Signing, Lock screen, Notifee foreground service).
  - `types/`: TypeScript interface and type definitions.
- `assets/`: Static assets (Icons, Images, SVGs, Audio).
- `patches/`: Native module patches applied via `patch-package`.

## Building and Running

### Prerequisites

- Node.js and **pnpm** (preferred).
- EAS CLI (for builds).
- Android Studio / Xcode (for local native builds).

### Key Commands

- **Install:** `pnpm install`
- **Start:** `pnpm start` (starts Expo dev server)
- **iOS Local:** `pnpm run ios`
- **Android Local:** `pnpm run android`
- **Codegen:** `pnpm run codegen` (generates GraphQL hooks from operations)
- **Lint:** `pnpm run lint`
- **Reset Project:** `node ./scripts/reset-project.js`

## Development Conventions

- **Routing:** Always use Expo Router's file-based routing. Use `router.replace()` for navigation logic in the entry point (`app/index.tsx`).
- **Styling:** Prefer NativeWind classes for layout and basic styling. Use `useThemeColor` hook for dynamic colors.
- **Data Fetching:** Use generated GraphQL hooks from `lib/services/graphql/generated`. Custom async logic should use TanStack Query.
- **State:** Use Zustand for global persistent state. Use local component state where possible.
- **Components:** Prefix components based on Atomic level: `a-` (atom), `m-` (molecule), `o-` (organism).
- **Images:** Use `expo-image` for optimized image rendering.
- **Icons:** Use `lucide-react-native`, `@expo/vector-icons`, or `IconSymbol` (from `components/ui`).

## GraphQL Codegen

The project uses `@graphql-codegen` to generate TypeScript types and Urql hooks.

- Schema: `https://devapi.kushicorp.com/graphql`
- Operations Location: `lib/services/graphql/requests/`
- Generated Code: `lib/services/graphql/generated/index.ts`
- Run `pnpm run codegen` whenever you update `.ts` files in the requests directory.

## Notifications & VoIP

Uses `@react-native-firebase/messaging` for remote notifications, `@notifee/react-native` for local notification handling, and `react-native-callkeep` with `react-native-voip-push-notification` for calling features. Custom foreground service plugins are located in `lib/plugins`.
