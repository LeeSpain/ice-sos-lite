import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.icesosinternational.app',
  appName: 'ICE SOS - Emergency Protection',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Production: Remove or comment this section for production builds
    url: 'https://a856a70f-639b-4212-b411-d2cdb524d754.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#ef4444",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: false
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
      permissions: {
        android: [
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_BACKGROUND_LOCATION"
        ],
        ios: [
          "NSLocationWhenInUseUsageDescription",
          "NSLocationAlwaysAndWhenInUseUsageDescription",
          "NSLocationAlwaysUsageDescription"
        ]
      }
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    App: {
      permissions: {
        android: [
          "android.permission.INTERNET",
          "android.permission.ACCESS_NETWORK_STATE",
          "android.permission.WAKE_LOCK",
          "android.permission.VIBRATE",
          "android.permission.CALL_PHONE",
          "android.permission.CAMERA",
          "android.permission.RECORD_AUDIO",
          "android.permission.WRITE_EXTERNAL_STORAGE",
          "android.permission.READ_EXTERNAL_STORAGE"
        ]
      }
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#ef4444"
    }
  }
};

export default config;