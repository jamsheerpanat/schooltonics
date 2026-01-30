# OctoSchoolEngine Mobile App

This is the mobile application for the OctoSchoolEngine ecosystem, built with Flutter.

## Getting Started

### Prerequisites
- Flutter SDK
- Android Studio / Xcode
- CocoaPods (for iOS)

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   ```

2. Get dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

## Networking

### API Base URL
The API base URL is configured in `lib/config/api_config.dart`.

- **Android Emulator**: Uses `10.0.2.2` to access the host machine's localhost.
- **iOS Simulator**: Uses `localhost`.
- **Physical Device**: You must update `baseUrl` to your computer's local IP address (e.g., `192.168.1.x`).

### Notifications (FCM)
The `NotificationService` in `lib/services/notification_service.dart` is currently a placeholder. Start here when integrating real Firebase Cloud Messaging.

## Structure

- `lib/config`: Configuration constants (API URLs, keys).
- `lib/screens`: UI screens organized by role (teacher, student, parent).
- `lib/services`: Singleton services for API, Auth, and Notifications.
