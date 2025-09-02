import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a856a70f639b4212b411d2cdb524d754',
  appName: 'ice-sos-lite',
  webDir: 'dist',
  server: {
    url: 'https://a856a70f-639b-4212-b411-d2cdb524d754.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ef4444",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      permissions: {
        android: [
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_BACKGROUND_LOCATION"
        ],
        ios: [
          "NSLocationWhenInUseUsageDescription",
          "NSLocationAlwaysAndWhenInUseUsageDescription"
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
          "android.permission.CALL_PHONE"
        ]
      }
    }
  }
};

export default config;