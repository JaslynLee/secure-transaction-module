# Secure Transaction History Module 👋

A universal React Native / Expo application implementing a secure transaction history viewer, featuring biometric authorization challenges, dynamic dark/light theme overrides, and decoupled asynchronous state management.

---

## 🚀 Getting Started

Follow these steps to run the application on your local machine:

### 1. Install Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Start the Development Server
Launch the Expo CLI server:
```bash
npx expo start
```

### 3. Open the App on Devices
Once the dev server is running, you can open the app on your preferred target:
*   **iOS Simulator**: Press **`i`** in the terminal or run `npm run ios`.
*   **Android Emulator**: Press **`a`** in the terminal or run `npm run android`.
*   **Web Browser**: Press **`w`** in the terminal or run `npm run web`.
*   **Physical Device**: Download the **Expo Go** app on your phone and scan the QR code displayed in your terminal.

## 🔑 Login and Testing Credentials

The application simulates security verification processes locally:
*   **Passcode**: To log in manually via the secure keypad, enter the passcode: **`123456`**.

---

## 📲 How to Test Biometrics by Platform

Select the guide below that matches your target testing platform:

### 1. Browser Web (Desktop / Mobile Browsers)
*   **Hardware Limit**: Browsers cannot interface directly with system biometric sensors.
*   **How to Test**:
    1.  Start the web version by running `npm run web` (or press `w` in your terminal).
    2.  On the Passcode screen, a **Developer Simulation Panel** will automatically render at the bottom of the view.
    3.  Click **"Simulate Biometrics Success"** or **"Simulate Biometrics Error"** to test success redirects and passcode fallbacks.

### 2. Physical Android Phone (Expo Go)
*   **Hardware Limit**: Works fully with native biometric prompts (Fingerprint and Face Unlock).
*   **How to Test**:
    1.  Ensure you have enrolled at least one Fingerprint/Face in your phone's Android **Settings -> Security** menu.
    2.  Install the **Expo Go** app from the Google Play Store.
    3.  Scan the terminal QR code to load the app.
    4.  Tapping the fingerprint icon on the login screen or dashboard will trigger the native Android biometric verification popup.

### 3. Physical iPhone (Expo Go)
*   **Hardware Limit**: **Touch ID** (fingerprint) works normally. **Face ID is unavailable** in Expo Go due to Apple App Store sandbox constraints (it will default to your iPhone's device passcode).
*   **How to Test Touch ID / Passcode Fallback**:
    1.  Ensure **Touch ID** (or device passcode) is set up in your iOS **Settings**.
    2.  Scan the terminal QR code using your iOS **Camera app** (which redirects into Expo Go).
    3.  Tapping the biometric button triggers the native Touch ID prompt or falls back to system passcode verification.
*   *Note*: To test native iOS Face ID on a physical iPhone, you must build a custom development client using a macOS computer (`npx expo run:ios`). Since a Mac is required, developers on Windows/Linux should test using Android physical devices or the web simulation controls.

---

## 🏗️ Architecture & Separation of Concerns

The module follows strict software design principles (SRP, DRY, and Decoupled States):
*   **`/src/app` (View / Routing)**: Handles RESTful routes (`/transaction`, `/transaction/[id]`, `/profile`) with custom layout transitions and theme-aware header navigation.
*   **`/src/api` (Network / Service)**: Communicates asynchronously via Redux Toolkit Query (`profileApi` and `transactionApi`). Query cache lifecycles are decoupled from authentication status.
*   **`/src/store` (State Management)**: Syncs state globally via Redux Toolkit slices (`authSlice` and `userSlice`).
*   **`/src/services` (OS Interactivity)**: Integrates native hardware wrappers such as `biometrics.ts`.
*   **`/src/utils` (Helpers)**: Centralizes formatting, text masking, and error extraction logic in `formatters.ts`.
