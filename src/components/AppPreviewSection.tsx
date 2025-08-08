
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AppPreviewPhone from "@/components/app-preview/AppPreviewPhone";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";

const SITE_CONTENT_KEY = "homepage_app_preview";

const AppPreviewSection: React.FC = () => {
  const defaults = React.useMemo(() => getDefaultAppPreview(), []);
  const { value, isLoading } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);

  return (
    <section className="container mx-auto px-4 py-12">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="items-center text-center">
          <CardTitle>See how the app looks</CardTitle>
          <CardDescription className="mt-2 max-w-2xl mx-auto">
            Explore a live preview of our mobile app. It updates automatically when admins save changes and connects with smart devices for real-time wellness and safety data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {isLoading && !value ? (
              <div className="text-muted-foreground">Loading preview...</div>
            ) : (
              <AppPreviewPhone config={value ?? defaults} />
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            This preview updates automatically when admins save changes in the App Testing page.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AppPreviewSection;
