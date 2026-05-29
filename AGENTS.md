# Kushi Expo App — Agent Guide

## Package Manager

- **pnpm** is preferred locally. CI uses `npm ci`. Both lockfiles exist (`pnpm-lock.yaml`, `package-lock.json`); keep them in sync.
- `.npmrc` sets `legacy-peer-deps=true` and `strict-peer-dependencies=false`.

## Key Commands

| Command | Purpose |
|---|---|
| `pnpm start` | Start Expo dev server |
| `pnpm run ios` / `pnpm run android` | Local native build |
| `pnpm run lint` | ESLint (expo lint) |
| `pnpm run codegen` | GraphQL codegen — generates types + Urql hooks from `lib/services/graphql/requests/` |
| `pnpm run postinstall` | Applies `patch-package` patches (3 patches in `patches/`) |

There is **no test setup** — no test runner, no jest config, no test script.

## Architecture

- **Navigation:** Expo Router file-based routing in `app/`. Two role-based tab navigators: `app/guest/` and `app/host/`.
- **Styling:** NativeWind (TailwindCSS for RN) with `jsxImportSource: "nativewind"` in Babel. Dynamic theme colors via `useThemeColor` hook.
- **API Layer:** Urql (GraphQL client) for queries/mutations/subscriptions + TanStack React Query for caching/async state.
- **State:** Zustand stores with AsyncStorage persistence in `lib/stores/`.
- **Calls:** Daily.co (WebRTC), react-native-callkeep (iOS VoIP), lock-screen-manager (Android native module).
- **Notifications:** Firebase Cloud Messaging + Notifee for local display + foreground service.
- **New Architecture enabled** (Fabric, TurboModules), Hermes JS engine.

## Component Conventions

Atomic Design with filename prefixes:
- `a-` (atoms), `m-` (molecules), `o-` (organisms)

## GraphQL Codegen

Config: `codegen.ts` — schema `https://devapi.kushicorp.com/graphql`. Run `pnpm run codegen` after editing `.graphql` or `.ts` operation files under `lib/services/graphql/requests/`. Output goes to `lib/services/graphql/generated/index.ts` (Urql hooks + types).

## Path Aliases

- `@/*` maps to root (`./*`), defined in `tsconfig.json`.

## Platform Quirks

- **Gradle pinned to 8.13** via custom config plugin (`withGradleVersion`). Do not upgrade — 8.14 breaks the build.
- **JVM heap set to 4GB** (`withGradleJvmArgs`) for dex merging.
- `react-native-callkeep` is **Android-only** (nulled on iOS in `react-native.config.js`).
- Prebuild step may be needed: `npx expo prebuild` before `expo run:android`/`expo run:ios`.

## Config Sources

- `app.config.js` is the **sole source of truth** for Expo config (no `app.json`). Note: `GEMINI.md` claims `reactCompiler: true` but `app.config.js` sets it to `false` — trust the config file.
- Environment is loaded from `.env` (dev) or `.env.prod` (production), switched by `APP_ENV` in EAS profiles.

## CI/CD

- GitHub Actions workflows build locally via `eas build --local --profile staging|production` and auto-submit to TestFlight / Play Store internal track.
- Trigger prefixes in commit messages: `[ios]` or `[android]`.
- Branches: `staging` → staging builds, `main` → production builds.

## Files of Interest

- `index.js` — app entry: VoIP push, CallKeep, Firebase background handler setup.
- `app/_layout.tsx` — root layout: provider nesting order (GraphQL → GestureHandler → Keyboard → TanStack → Paper → SafeArea → Notification → Theme).
- `lib/utils/auth.ts` — token save/load/clear from AsyncStorage.
- `components/providers/graphql-client.tsx` — Urql client with auth exchange + WebSocket subscriptions.
