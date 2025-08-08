
export interface AppPreviewCard {
  icon: string;
  title: string;
  status: string;
  description: string;
}

export interface AppPreviewConfig {
  appName: string;
  tagline: string;
  primaryColor?: string;
  sosColor?: string;
  voiceLabel: string;
  sosLabel: string;
  sosSubLabel: string;
  cards: AppPreviewCard[];
}

export const getDefaultAppPreview = (): AppPreviewConfig => ({
  appName: "ICE SOS Lite",
  tagline: "Tap once for immediate help",
  primaryColor: "#ef4444",
  sosColor: "#22c55e",
  voiceLabel: "Voice OFF",
  sosLabel: "Emergency SOS",
  sosSubLabel: "Tap for immediate help",
  cards: [
    { icon: "heart", title: "Health Status", status: "Normal", description: "All vitals within normal range" },
    { icon: "bell", title: "Reminders", status: "2 Today", description: "Morning medication due in 30 min" },
    { icon: "activity", title: "Guardian AI", status: "Active", description: "\"How are you feeling today?\"" },
  ],
});
