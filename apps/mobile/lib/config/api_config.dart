class ApiConfig {
  // Use 10.0.2.2 for Android Emulator to access localhost
  // Use localhost for iOS Simulator
  // Use actual IP for physical devices
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1';
  
  static const String loginEndpoint = '/auth/login';
  static const String userEndpoint = '/auth/me';
  static const String healthEndpoint = '/health';
}
