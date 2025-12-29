# SafeRaasta Project Structure & Technical Documentation

## Project Overview
**Name:** SafeRaasta  
**Version:** 0.0.1  
**Type:** React Native Mobile Application (Android & iOS)  
**Package ID:** com.saferaastaai

---

## Technology Stack

### Core Framework
- **React Native:** 0.74.5
- **React:** 18.3.1
- **Node.js:** >=20
- **TypeScript:** 5.8.3

### Navigation & State Management
- **@react-navigation/native:** 7.1.26
- **@react-navigation/stack:** 7.6.13
- **@react-native-async-storage/async-storage:** 2.2.0

### Maps & Location Services
- **react-native-maps:** 1.14.0 (with custom patches)
- **react-native-geolocation-service:** 5.3.1
- **react-native-google-places-autocomplete:** 2.6.3
- **react-native-permissions:** 5.4.4

### Backend & Authentication
- **firebase:** 12.7.0

### Development Tools
- **@babel/core:** 7.25.2
- **@babel/preset-env:** 7.25.3
- **@react-native-community/cli:** 13.6.9
- **eslint:** 8.19.0
- **jest:** 29.6.3
- **patch-package:** 8.0.1
- **prettier:** 2.8.8

---

## Android Configuration

### Build Configuration
- **Build Tools Version:** 34.0.0
- **Min SDK Version:** 23
- **Compile SDK Version:** 34
- **Target SDK Version:** 34
- **NDK Version:** 26.1.10909125
- **Kotlin Version:** 1.9.22
- **Gradle:** Uses Gradle wrapper

### Google Play Services
- **play-services-maps:** 19.2.0 (Required for MapColorScheme API)
- **play-services-location:** 21.3.0
- **play-services-base:** 18.5.0

### Android Dependencies
- **AndroidX:** Enabled
- **Hermes JS Engine:** Enabled
- **Supported Architectures:** armeabi-v7a, arm64-v8a, x86, x86_64

### Android Namespace
- **Package:** com.saferaastaai
- **Version Code:** 1
- **Version Name:** 1.0

---

## iOS Configuration

### Platform
- **Minimum iOS Version:** As per React Native 0.74.5 standards
- **CocoaPods:** Used for dependency management
- **Target:** SafeRaasta

### iOS Dependencies
- Managed through Podfile with React Native auto-linking
- Uses native modules configuration

---

## Project File Structure

```
SafeRaasta/
├── Root Configuration Files
│   ├── package.json                    # Project dependencies and scripts
│   ├── app.json                        # React Native app configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── babel.config.js                 # Babel transpiler configuration
│   ├── metro.config.js                 # Metro bundler configuration
│   ├── jest.config.js                  # Jest testing configuration
│   ├── README.md                       # Project documentation
│   ├── Gemfile                         # Ruby dependencies (for iOS)
│   ├── index.js                        # Entry point for React Native
│   ├── App.tsx                         # Main app component
│   ├── enable-metro-firewall.bat       # Metro firewall script
│   ├── run-dev.bat                     # Development run script
│   ├── patch-rn-graphics-fix.js        # Graphics bug patch script
│   └── patch-rn-graphics.js            # Graphics patch script
│
├── __tests__/                          # Test files
│   └── App.test.tsx                    # App component tests
│
├── android/                            # Android native code
│   ├── build.gradle                    # Root Gradle configuration
│   ├── gradle.properties               # Gradle properties
│   ├── gradlew                         # Gradle wrapper (Unix)
│   ├── gradlew.bat                     # Gradle wrapper (Windows)
│   ├── local.properties                # Local Android SDK path
│   ├── settings.gradle                 # Gradle settings
│   ├── app/
│   │   ├── build.gradle                # App-level Gradle config
│   │   ├── google-services.json        # Firebase configuration
│   │   ├── proguard-rules.pro          # ProGuard rules
│   │   ├── build/                      # Build output directory
│   │   │   ├── generated/              # Auto-generated code
│   │   │   ├── intermediates/          # Build intermediates
│   │   │   ├── kotlin/                 # Kotlin compiled files
│   │   │   ├── outputs/                # APK/Bundle outputs
│   │   │   ├── snapshot/               # Build snapshots
│   │   │   └── tmp/                    # Temporary build files
│   │   └── src/
│   │       └── main/                   # Main Android source
│   └── gradle/
│       └── wrapper/
│           └── gradle-wrapper.properties
│
├── ios/                                # iOS native code
│   ├── Podfile                         # CocoaPods dependencies
│   ├── SafeRaasta/
│   │   ├── AppDelegate.swift           # iOS app delegate
│   │   ├── Info.plist                  # iOS app info
│   │   ├── LaunchScreen.storyboard     # Launch screen
│   │   ├── PrivacyInfo.xcprivacy       # Privacy manifest
│   │   └── Images.xcassets/            # Image assets
│   │       ├── Contents.json
│   │       └── AppIcon.appiconset/     # App icons
│   └── SafeRaasta.xcodeproj/           # Xcode project
│       ├── project.pbxproj
│       └── xcshareddata/
│           └── xcschemes/
│
├── assets/                             # Static assets
│   └── images/                         # Image files
│
├── patches/                            # Third-party library patches
│   └── react-native-maps+1.14.0.patch  # Custom patches for react-native-maps
│
└── src/                                # Source code
    ├── components/                     # Reusable UI components
    │   ├── InputField.tsx              # Text input component
    │   └── PrimaryButton.tsx           # Primary button component
    │
    ├── config/                         # Configuration files
    │   └── keys.js                     # API keys and secrets
    │
    ├── firebase/                       # Firebase integration
    │   └── firebaseConfig.js           # Firebase initialization
    │
    ├── screens/                        # Screen components
    │   ├── LandingScreen.js            # Landing/welcome screen
    │   ├── LoginScreen.tsx             # User login screen
    │   ├── SignUpScreen.tsx            # User registration screen
    │   ├── ForgotPasswordScreen.tsx    # Password recovery screen
    │   └── MapScreen.js                # Main map interface
    │
    ├── services/                       # Business logic services
    │   ├── authService.js              # Authentication service
    │   └── directionsService.js        # Maps directions service
    │
    └── theme/                          # UI theme configuration
        └── colors.js                   # Color palette
```

---

## NPM Scripts

```json
{
  "android": "react-native run-android",
  "ios": "react-native run-ios",
  "lint": "eslint .",
  "start": "react-native start",
  "test": "jest",
  "postinstall": "patch-package"
}
```

---

## Key Dependencies Detailed

### Production Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/native": "^7.1.26",
  "@react-navigation/stack": "^7.6.13",
  "firebase": "^12.7.0",
  "react": "18.3.1",
  "react-native": "0.74.5",
  "react-native-geolocation-service": "^5.3.1",
  "react-native-google-places-autocomplete": "^2.6.3",
  "react-native-maps": "1.14.0",
  "react-native-permissions": "^5.4.4"
}
```

### Development Dependencies
```json
{
  "@babel/core": "^7.25.2",
  "@babel/preset-env": "^7.25.3",
  "@babel/runtime": "^7.25.0",
  "@react-native-community/cli": "13.6.9",
  "@react-native-community/cli-platform-android": "13.6.9",
  "@react-native-community/cli-platform-ios": "13.6.9",
  "@react-native/babel-preset": "0.74.87",
  "@react-native/eslint-config": "0.74.87",
  "@react-native/metro-config": "0.74.87",
  "@react-native/typescript-config": "0.74.87",
  "@types/jest": "^29.5.13",
  "@types/react": "^18.3.14",
  "@types/react-test-renderer": "^18.3.0",
  "eslint": "^8.19.0",
  "jest": "^29.6.3",
  "patch-package": "^8.0.1",
  "prettier": "2.8.8",
  "react-test-renderer": "18.3.1",
  "typescript": "^5.8.3"
}
```

---

## Babel Configuration

### Presets
- `module:@react-native/babel-preset`

### Plugins
- `@babel/plugin-transform-class-properties` (loose mode)
- `@babel/plugin-transform-private-methods` (loose mode)
- `@babel/plugin-transform-private-property-in-object` (loose mode)

### Overrides
- Special handling for `react-native-maps` to avoid loose mode plugins

---

## TypeScript Configuration

```jsonc
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "types": ["jest"]
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["**/node_modules", "**/Pods"]
}
```

---

## Custom Patches & Fixes

### react-native-maps Patch
- **File:** `patches/react-native-maps+1.14.0.patch`
- **Purpose:** Custom modifications to react-native-maps library
- **Applied via:** patch-package (runs automatically on postinstall)

### React Native Graphics Fix
- **Files:** 
  - `patch-rn-graphics-fix.js`
  - `patch-rn-graphics.js`
- **Purpose:** Fixes std::format bug in React Native 0.83.1 graphicsConversions.h
- **Implementation:** Gradle task that patches the file in Gradle cache before CMake configuration
- **Details:** Replaces `std::format` with `folly::to<std::string>` for dimension value formatting

---

## Application Architecture

### Authentication Flow
1. **LandingScreen** → Initial screen
2. **LoginScreen** → User login
3. **SignUpScreen** → New user registration
4. **ForgotPasswordScreen** → Password recovery

### Main Features
- **MapScreen** → Core map functionality with:
  - Google Maps integration
  - Location services
  - Place autocomplete
  - Directions service

### Services Layer
- **authService.js** → Handles authentication with Firebase
- **directionsService.js** → Manages map directions and routing

### UI Components
- **InputField.tsx** → Standardized text input
- **PrimaryButton.tsx** → Branded button component
- **colors.js** → Centralized color theme

---

## Firebase Integration
- **Configuration:** `src/firebase/firebaseConfig.js`
- **Services:** Firebase SDK v12.7.0
- **Android Config:** `android/app/google-services.json`
- **Features:** Authentication and potentially other Firebase services

---

## Build & Development

### Android Build
```bash
# Run development build
npx react-native run-android

# Or use custom script
run-dev.bat
```

### iOS Build
```bash
# Install Ruby dependencies
bundle install

# Install CocoaPods
bundle exec pod install

# Run iOS app
npx react-native run-ios
```

### Start Metro Bundler
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

---

## Environment Requirements

### Required Tools
- **Node.js:** Version 20 or higher
- **Java JDK:** 17 (Microsoft JDK 17.0.17.10-hotspot)
- **Android Studio:** For Android development
- **Xcode:** For iOS development (macOS only)
- **Ruby:** For CocoaPods (iOS)
- **CocoaPods:** For iOS dependencies

### Platform-Specific
- **Android:** Requires Android SDK with Build Tools 34.0.0
- **iOS:** Requires macOS with Xcode and command line tools

---

## Important Notes

1. **Patch Package:** The project uses `patch-package` to maintain custom patches. Run `npm install` to apply patches automatically.

2. **Android Graphics Bug:** The project includes a custom Gradle task to fix the React Native 0.83.1 graphics conversion bug.

3. **Google Maps API:** Requires valid API keys in `src/config/keys.js` for maps functionality.

4. **Firebase:** Requires `google-services.json` for Android and proper Firebase configuration.

5. **Permissions:** The app requests location permissions managed through `react-native-permissions`.

6. **Hermes Engine:** Enabled for improved performance on both platforms.

---

## Development Workflow

1. Install dependencies: `npm install`
2. For iOS: `cd ios && bundle install && bundle exec pod install`
3. Start Metro: `npm start`
4. Run Android: `npm run android` (in new terminal)
5. Run iOS: `npm run ios` (in new terminal)

---

## Project Status
- **Current Date:** December 29, 2025
- **Active Development:** Yes
- **Last Build:** Android successful with Metro bundler running

---

*This document provides a comprehensive overview of the SafeRaasta project structure, dependencies, and configuration for sharing with AI assistants or team members.*
