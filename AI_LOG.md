# AI log

> **TODO (Devendra):** review every line of this file before submitting. It was drafted from the working session; correct anything that does not match what you did, and fill in the section "What I wrote by hand".

## Tools

- **Claude Code** (Anthropic's CLI agent, model Claude Opus 5.5), used in the terminal inside this repository. It scaffolded the project, wrote code and tests, ran the builds, and checked the result on the Android emulator and the iOS simulator with `adb` and `xcrun simctl`.

## How I worked with it

I gave the direction and it did the typing. I chose the stack, the folder layout, the order of features and the visual reference, and asked for one branch per feature with separate commits. After each feature I asked what was verified and what was not, and several of the fixes below came from that.

## Key prompts

Quoted as typed.

1. Choosing the stack, after it proposed zustand and zod:
   > install that pakage for that remove that zod and zustand but the use the react native toolkit for that also extra bonus also install as well also install that react-native-size-matters for the sizes

2. Setting the visual direction for Home, with three screenshots of Zepto's home screen:
   > this is the demo images for the zepto i hav click it so can you able to do this as per that changes as well

3. Asking for offline handling, and then acting on the conflict it reported with the brief:
   > also add the netinfo as well if the user is not able to online then show the screen of the no internent and once they come to then it will be the shown the result as well

   > so if they do that we have to do so fix that conflict as well

4. Auditing against the brief instead of trusting "done":
   > check the pdf have all the content have you done it ? if not then let me know that

## The hard parts

**1. A fresh template app that crashed on launch (iOS 27).**
The app quit immediately on the iOS 27 simulator. The crash report pointed at `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`: iOS 27 requires the UIScene lifecycle and the React Native 0.87.1 template does not adopt it. The fix was a `SceneDelegate` plus a `UIApplicationSceneManifest` entry, with React Native started from the scene. Later, Xcode 27 also refused to build two pods that declared iOS 12.4 and 13.0, which needed a `post_install` step in the `Podfile`.

**2. Config-driven rendering that cannot crash.**
The home screen has to survive anything an admin puts in the config. The design that came out of this: validate the payload as unknown data, drop a single bad tab or section rather than rejecting everything, keep unknown section types so the renderer can skip them, and let each section parse its own items. The renderer looks types up with `Object.hasOwn` so a type named `constructor` cannot resolve to something on `Object.prototype`.

**3. Text that stays readable on any background.**
Section backgrounds are arbitrary colours, gradients or photos from the config, so text colour cannot be fixed. It is computed from the background's luminance, and photos get a scrim. Dark mode made this harder: "the light text colour" is a different palette entry in each theme, so the theme hook exposes `lightText` and `darkText` instead of components guessing.

**4. Optimistic booking with honest reconciliation.**
Confirming has to feel instant but must not lie. The booking is stored as `pending` and the slot is marked taken in the cached list at once; the server's answer then confirms it or marks it failed, undoes the slot change and refetches. The offline queue reuses the same path with an extra `queued` state, and a booking that was mid-request when the app closed is put back in the queue because its outcome is unknown.

**5. Shared-element transition.**
See the next section; this one took three attempts.

## Where the AI was wrong, and how it was caught

**The shared-element transition did not actually work.** The first version used Reanimated's `sharedTransitionTag` and enabled its `ENABLE_SHARED_ELEMENT_TRANSITIONS` feature flag. It built, nothing crashed, and two screenshots looked right, so it could easily have been reported as done. It was caught by recording the screen and looking at the frames one by one: the photo was cross-fading with the screen, not moving. The flag was confirmed to be compiled in, so the cause was that the built-in transition does not run from a screen inside bottom tabs. It was replaced with a hand-built version that measures the photo on Home and animates a copy into place. The frame check then found two more bugs in that version: the photo started at the wrong size (the measured wrapper was wider than the photo), and it first appeared in the wrong place because it was drawn before the screen's own position was known.

Other mistakes from the same session:

- **A blocking "No internet" screen.** I asked for a full-screen offline state and it built one. It then pointed out that the brief says a failed network "must leave the app usable", and the screen was replaced with a banner over cached content. The same change exposed that the in-app mock was still answering while offline, so offline behaviour had been fake; requests now fail offline like real ones.
- **Stale Metro cache.** After the Worklets Babel plugin was added, the app crashed with `Cannot read property 'bytecode' of undefined`. Metro had been started before the plugin existed and was serving old output. Restarting it with `--reset-cache` fixed it.
- **The slot sheet did not open on the first tap.** The sheet was only mounted once a doctor was chosen, so it was not ready when the button was pressed. Found by tapping through the flow on the emulator; fixed by keeping it mounted.
- **Unused dependency.** It installed `@tanstack/react-query` and then used RTK Query for everything, and said so. It is still in `package.json`.

## What the AI did not verify

It reported these limits itself, and they are still open: most features were run only on the Android emulator in debug mode; Hindi and Telugu text is unreviewed; the forced booking failure is covered by tests but was not run in the app; nothing was measured on a physical mid-range Android device.

## What I wrote by hand

TODO (Devendra): list what you typed or changed yourself. From the session: the `src/` folder layout was created by hand before any feature code, and the decisions above (stack, branch-per-feature workflow, Zepto as reference, which bonuses to build) were mine. The application code and tests were written by Claude Code.
