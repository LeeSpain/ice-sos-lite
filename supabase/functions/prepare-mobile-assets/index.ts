import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Preparing mobile app assets...");

    // Mobile app configuration
    const mobileConfig = {
      appId: "com.icesosinternational.app",
      appName: "ICE SOS - Emergency Protection",
      version: "1.0.0",
      buildNumber: "1",
      platforms: ["ios", "android"],
      
      // Icons and splash screens
      assets: {
        icons: {
          ios: [
            { size: "20x20", scale: 2, name: "AppIcon-20@2x.png" },
            { size: "20x20", scale: 3, name: "AppIcon-20@3x.png" },
            { size: "29x29", scale: 2, name: "AppIcon-29@2x.png" },
            { size: "29x29", scale: 3, name: "AppIcon-29@3x.png" },
            { size: "40x40", scale: 2, name: "AppIcon-40@2x.png" },
            { size: "40x40", scale: 3, name: "AppIcon-40@3x.png" },
            { size: "60x60", scale: 2, name: "AppIcon-60@2x.png" },
            { size: "60x60", scale: 3, name: "AppIcon-60@3x.png" },
            { size: "1024x1024", scale: 1, name: "AppIcon-1024.png" }
          ],
          android: [
            { density: "mdpi", size: "48x48", name: "ic_launcher.png" },
            { density: "hdpi", size: "72x72", name: "ic_launcher.png" },
            { density: "xhdpi", size: "96x96", name: "ic_launcher.png" },
            { density: "xxhdpi", size: "144x144", name: "ic_launcher.png" },
            { density: "xxxhdpi", size: "192x192", name: "ic_launcher.png" }
          ]
        },
        splashScreens: {
          ios: [
            { size: "1242x2688", name: "LaunchImage-iPhone11ProMax.png" },
            { size: "1125x2436", name: "LaunchImage-iPhoneX.png" },
            { size: "750x1334", name: "LaunchImage-iPhone8.png" },
            { size: "1536x2048", name: "LaunchImage-iPadPro.png" }
          ],
          android: [
            { density: "mdpi", size: "320x480", name: "splash.png" },
            { density: "hdpi", size: "480x800", name: "splash.png" },
            { density: "xhdpi", size: "720x1280", name: "splash.png" },
            { density: "xxhdpi", size: "1080x1920", name: "splash.png" }
          ]
        }
      },

      // Deployment steps
      deploymentSteps: [
        {
          platform: "ios",
          steps: [
            "Export project to GitHub",
            "Run 'npm install' locally",
            "Run 'npx cap add ios'",
            "Run 'npm run build'",
            "Run 'npx cap sync ios'",
            "Open Xcode project",
            "Configure signing & provisioning",
            "Archive and upload to App Store Connect",
            "Submit for review"
          ]
        },
        {
          platform: "android",
          steps: [
            "Export project to GitHub",
            "Run 'npm install' locally",
            "Run 'npx cap add android'",
            "Run 'npm run build'",
            "Run 'npx cap sync android'",
            "Open Android Studio project",
            "Generate signed APK",
            "Upload to Google Play Console",
            "Submit for review"
          ]
        }
      ],

      // Store listing information
      storeListing: {
        ios: {
          appName: "ICE SOS - Emergency Protection",
          subtitle: "Personal Safety & Emergency Response",
          keywords: "emergency, safety, family, location, sos, alert, protection",
          category: "Medical",
          description: "ICE SOS provides instant emergency response and family safety features. Send alerts, share location, and access emergency services when you need help most.",
          privacyPolicyUrl: "https://icesosinternational.com/privacy",
          supportUrl: "https://icesosinternational.com/support"
        },
        android: {
          appName: "ICE SOS - Emergency Protection",
          shortDescription: "Personal Safety & Emergency Response",
          fullDescription: "ICE SOS provides instant emergency response and family safety features. Send alerts, share location, and access emergency services when you need help most.",
          category: "Medical",
          contentRating: "Everyone",
          privacyPolicyUrl: "https://icesosinternational.com/privacy"
        }
      }
    };

    // Generate asset requirements
    const assetRequirements = {
      screenshots: {
        ios: [
          "iPhone 6.7-inch (3 required, 10 max)",
          "iPhone 6.5-inch (3 required, 10 max)",
          "iPhone 5.5-inch (3 required, 10 max)",
          "iPad Pro 3rd gen (3 required, 10 max)",
          "iPad Pro 2nd gen (3 required, 10 max)"
        ],
        android: [
          "Phone screenshots (2-8 required)",
          "7-inch tablet (optional)",
          "10-inch tablet (optional)"
        ]
      },
      
      features: [
        "Emergency SOS alerts",
        "Real-time location sharing",
        "Family safety circles", 
        "Quick emergency contacts",
        "Offline emergency info",
        "Push notifications",
        "Background location tracking"
      ],

      permissions: {
        ios: [
          "Location Services (Always)",
          "Push Notifications",
          "Camera (for profile photos)",
          "Phone (for emergency calls)",
          "Contacts (for emergency contacts)"
        ],
        android: [
          "ACCESS_FINE_LOCATION",
          "ACCESS_BACKGROUND_LOCATION", 
          "CALL_PHONE",
          "CAMERA",
          "VIBRATE",
          "WAKE_LOCK",
          "RECEIVE_BOOT_COMPLETED"
        ]
      }
    };

    console.log("Mobile assets prepared successfully");

    return new Response(
      JSON.stringify({
        success: true,
        mobileConfig,
        assetRequirements,
        message: "Mobile app assets and configuration prepared successfully",
        nextSteps: [
          "Export project to GitHub using the export button",
          "Follow the deployment guide in docs/MOBILE_APP_DEPLOYMENT.md", 
          "Generate app icons and splash screens using the provided specifications",
          "Take screenshots for app store listings",
          "Build and submit apps to both stores"
        ]
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error preparing mobile assets:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: "Failed to prepare mobile assets"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});