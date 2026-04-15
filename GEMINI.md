# Kushi Expo App

A comprehensive mobile application built with React Native and Expo, serving as a platform for hosting and guest services. It features real-time communication, secure payments, KYC verification, and booking management.

## Project Overview

*   **Framework:** Expo (SDK 54) with Expo Router (file-based navigation).
*   **Language:** TypeScript.
*   **Styling:** NativeWind (TailwindCSS for React Native) and React Native Paper.
*   **API Layer:** GraphQL via Urql, with TanStack Query for caching and asynchronous state management.
*   **State Management:** Zustand (with persistence via AsyncStorage).
*   **Real-time Communication:** Daily.co for video/audio calls and WebRTC.
*   **Push Notifications:** Firebase Cloud Messaging (FCM) and Notifee.
*   **Authentication:** Google Sign-In, Apple Authentication, and OTP-based verification.
*   **Payments:** Flutterwave integration.

## Project Structure

*   `app/`: Main application routing logic using Expo Router.
    *   `auth/`: Authentication flow (Sign-in, Sign-up, OTP, Reset password).
    *   `guest/`: Guest-facing interface (Home, Chat, Profile, Saved listings).
    *   `host/`: Host-facing interface (Analytics, Listings, Profile, Chat).
    *   `kyc/`: Identity verification flow (BVN, NIN, Image).
    *   `bookings/`, `chats/`, `hostings/`, `users/`: Feature-specific modules.
*   `components/`: UI components following Atomic Design principles.
    *   `atoms/`: Basic building blocks (Buttons, Inputs, Text, etc.).
    *   `molecules/`, `organisms/`: Complex UI components.
    *   `providers/`: Context providers (GraphQL, TanStack, Paper, etc.).
*   `lib/`: Core application logic.
    *   `hooks/`: Custom React hooks (e.g., `useUser`, `use-color-scheme`).
    *   `services/`: External service integrations, primarily GraphQL requests and generated types.
    *   `stores/`: Zustand store definitions for global state (Users, Hostings, etc.).
    *   `utils/`: Helper functions (Auth, Colors, Notifications, etc.).
    *   `types/`: TypeScript interface and type definitions.
*   `assets/`: Static assets (Icons, Images, SVGs, Audio).

## Building and Running

### Prerequisites
*   Node.js and pnpm/npm.
*   EAS CLI (for builds).
*   Android Studio / Xcode (for local native builds).

### Key Commands
*   **Install:** `npm install`
*   **Start:** `npm start` (starts Expo dev server)
*   **iOS Local:** `npm run ios`
*   **Android Local:** `npm run android`
*   **Codegen:** `npm run codegen` (generates GraphQL hooks from operations)
*   **Lint:** `npm run lint`
*   **Reset Project:** `npm run reset-project`

## Development Conventions

*   **Routing:** Always use Expo Router's file-based routing. Use `router.replace()` for navigation logic in the entry point.
*   **Styling:** Prefer NativeWind classes for layout and basic styling. Use `useThemeColors` hook for dynamic colors (Dark/Light mode).
*   **Data Fetching:** Use generated GraphQL hooks from `lib/services/graphql/generated`. Custom async logic should use TanStack Query.
*   **State:** Use Zustand for global persistent state. Use local component state where possible.
*   **Components:** Prefix atomic components with `a-` (e.g., `a-button.tsx`, `a-themed-text.tsx`).
*   **Images:** Use `expo-image` for optimized image rendering.
*   **Icons:** Use `lucide-react-native` or `@expo/vector-icons`.

## GraphQL Codegen
The project uses `@graphql-codegen` to generate TypeScript types and Urql hooks.
*   Schema: `https://devapi.kushicorp.com/graphql`
*   Operations Location: `lib/services/graphql/requests/`
*   Generated Code: `lib/services/graphql/generated/index.ts`
*   Run `npm run codegen` whenever you update `.ts` files in the requests directory.

## Notifications
Uses a combination of `@react-native-firebase/messaging` for remote notifications and `@notifee/react-native` for local notification handling, including custom foreground service plugins.
