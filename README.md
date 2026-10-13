# TapzaCare

A React Native app for patients of a neighbourhood clinic, built for the Tapza Care assignment. The home screen is drawn entirely from a remote layout config, so the clinic can change colours, banners and section order (for example on a festival day) without an app release.

- React Native 0.87.1 (new architecture), TypeScript strict
- Three screens from the brief: config-driven Home, Booking, Prescriptions and reminders
- Mock backend inside the app, with switches for latency and failure

- **Demo video:** [TapzaCare demo](https://drive.google.com/file/d/1yD8fQF_gTJS7IkqgUOFWXL_l9NlVOp33/view?usp=sharing) (Google Drive)
- **APK:** [TapzaCare-v1.0.apk](https://drive.google.com/file/d/1QLVAm2FvRbub5bH6WfQmfLnlGUnGuI15/view?usp=drive_link) (Google Drive)

The APK and the video are too large for the repository, so both are hosted on Google Drive.

> **TODO (Devendra) before submitting:** fill in "Time spent" and add the screenshots to `/docs`.

## Run it

Requirements: Node 22.11 or newer, a JDK and Android Studio with an emulator, and for iOS Xcode with CocoaPods.

```sh
npm install

# Android
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

`npm run android` and `npm run ios` start Metro for you. If you change `babel.config.js`, restart Metro with `npm start -- --reset-cache`.

Checks:

```sh
npm test          # 77 Jest tests
npx tsc --noEmit  # type check
npm run lint
```

### Install the APK

Download [`TapzaCare-v1.0.apk` from Google Drive](https://drive.google.com/file/d/1QLVAm2FvRbub5bH6WfQmfLnlGUnGuI15/view?usp=drive_link).

- **On a phone:** open the downloaded file and allow "Install unknown apps" for your browser or file manager when Android asks.
- **From a computer:** `adb install -r TapzaCare-v1.0.apk`

The APK is a release build: the JavaScript is bundled inside it, so it runs without Metro. It is signed with the template's debug key, which is fine for review but not for the Play Store.

### Build the APK yourself

```sh
npm run apk            # builds android/app/build/outputs/apk/release/app-release.apk
npm run apk:install    # installs it on the connected device or emulator
```

## Using the app, start to finish

1. **Home.** The app fetches `GET /config` and draws the theme, the bottom tabs and the home sections from it, in the order the config gives. Scroll: sections fade in, the hero has parallax, and the clinic row collapses into a pinned search bar.
2. **Switch the day.** Tap the **Festival** pill in the search bar (or Profile → Home layout). The app fetches the Diwali config: different colours, banner, section order and items, with no code change.
3. **Book an appointment.** Tap a doctor, a service, or the **Book** quick action. Choose a doctor and a date, tap **Choose a time**, pick a slot in the bottom sheet (drag it down to close) and confirm. The success screen appears at once and says "Confirming with the clinic…", then "Confirmed by the clinic". The booking is listed under the **Bookings** tab.
4. **See a booking fail.** Profile → Fail requests → **Bookings**, then book again. The success screen flips to "Booking did not go through", the slot becomes free again, and you can choose another time.
5. **Prescriptions.** Open the **Prescriptions** tab and tap one. Medicines are grouped into Morning, Afternoon and Night. Tap a row to mark the dose as taken; the tick survives an app restart and resets the next day.
6. **Reminders.** On a prescription, switch on **Remind me every day**. Use "Send a test reminder in 10 seconds" to see one arrive.
7. **Language and appearance.** Profile → Language (English, हिन्दी, తెలుగు) and Appearance (System, Light, Dark).
8. **Bad network.** Profile → Network speed → Slow shows the skeletons. Fail requests → Config, then pull to refresh on Home: the last good config stays on screen with a "showing saved content" notice. Turning the device offline shows a banner above the tab bar; a booking made offline is queued and sent when the connection returns.
9. **Admin.** Profile → **Edit home config (admin)**: change colours, reorder or remove sections, tap Apply, and go back to Home.

Deep links (app installed):

```sh
adb shell am start -a android.intent.action.VIEW -d "tapzacare://doctor/doc_2" com.tapzacare
xcrun simctl openurl booted "tapzacare://prescription/rx_1"
```

## How it works

```
Screen ── RTK Query hook ── mockBaseQuery ── mockRequest() ── src/data/*
                │                                  │
                └── Redux store (settings) ────────┘  latency, failure, day, language
```

- **Mock backend** (`src/services/mockServer.ts`). One function answers the five endpoints from the brief: `GET /config`, `GET /doctors`, `GET /slots?doctorId=&date=`, `POST /bookings`, `GET /prescriptions`. It waits for the configured latency, fails when the failure switch says so, and returns 409 when a slot is already taken. To use a real backend, replace `mockBaseQuery` in `src/services/api.ts` with `fetchBaseQuery`; nothing else changes.
- **Config pipeline** (`src/services/api.ts`, `src/utils/validateConfig.ts`). The response is treated as unknown data and validated. A bad section or tab is dropped; a config that cannot drive the app at all is rejected. On failure the app falls back to the last good config in AsyncStorage, then to a bundled default, so it always opens.
- **Section renderer** (`src/components/home/SectionRenderer.tsx`). A map from section `type` to component. A type this build does not know renders nothing. Adding a section type is one component and one line in the map. Each section parses its own items and drops malformed ones.
- **Theming** (`src/hooks/useTheme.ts`). Every colour comes from the config; components contain no colour literals. Text colour on each section is computed from that section's background so it stays readable on any colour an admin picks.
- **Optimistic booking** (`src/store/bookingsSlice.ts`). Confirming stores the booking as `pending` and marks the slot taken in the cached slot list immediately. The `POST` then settles it to `confirmed` or `failed`; on failure the slot change is undone, and slots are refetched either way. Offline, the booking is stored as `queued` and sent on reconnect.
- **Animation.** Scroll effects, the bottom sheet and the success animation run on the UI thread with Reanimated and Gesture Handler.

## Project structure

```
App.tsx                 providers, restores saved language / doses / bookings
src/
  types/api.ts          shapes from the brief
  data/                 mock data: configs (normal, festival), doctors, prescriptions, translations
  services/             mockServer, api (RTK Query), configCache, reminders
  store/                settings, bookings, doses slices
  navigation/           tabs built from config, stack for booking / prescription / admin, deep links
  screens/              Home, Booking, Bookings, Prescriptions, PrescriptionDetail, Profile, ConfigAdmin
  components/
    home/               header, skeleton, section shell, sections/ (the six section types)
    booking/            doctor picker, date strip, slot sheet, result, success animation
    prescriptions/      dose row, reminder card
  hooks/                useConfig, useTheme, navigation helpers
  utils/                validateConfig, schedule, color, date, format, haptics
  i18n/                 en, hi, te
  constants/            spacing and type scale, bundled fallback config, icon registry
__tests__/              Jest tests
```

## Decisions

- **Redux Toolkit with RTK Query** for server data and app state. One cache gives loading and error states, refetch on reconnect, and the optimistic slot update with undo.
- **Hand-written config validator instead of a schema library.** The rules are small, and "drop the bad section, keep the rest" is easier to read as plain code. It is covered by tests.
- **Mock in the app rather than a separate server**, so the reviewer needs nothing else running and the failure switches are one tap away.
- **Offline shows a banner, not a blocking screen.** The brief asks that a bad network leaves the app usable.
- **Bookings and taken doses are stored on the device.** The brief defines no endpoint to list bookings or record doses.
- **Sizes go through `react-native-size-matters`**; text keeps OS font scaling on, and every tap target has a 44 pt minimum.

### Extensions to the brief's config shape

Both are optional; a config without them behaves exactly as the brief describes.

- `theme.dark`: a second palette used in dark mode.
- `sections[].background.darkValue`: the background to use in dark mode.

## What was cut or is unfinished

- No Detox or Maestro end-to-end test.
- Service, banner and doctor photos are placeholder images from `picsum.photos` and `pravatar.cc`.
- The search bar and the category chips are visual only.
- The shared-element transition is hand-built (the library's own does not run from a tab screen) and has a short pause before the photo moves.
- Reminder times are fixed at 8:00, 14:00 and 21:00.
- Admin edits are kept in memory and reset when the app restarts.
- Hindi and Telugu text has not been reviewed by a native speaker.
- Tested mostly on an Android emulator in debug mode. On iOS only launch, Home, deep links and one dark-mode screen were checked. Not profiled on a physical mid-range Android device.

## Time spent

TODO (Devendra).

## AI usage

See [AI_LOG.md](AI_LOG.md).
