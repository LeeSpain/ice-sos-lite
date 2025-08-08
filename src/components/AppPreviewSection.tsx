
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppPreviewPhone from "@/components/app-preview/AppPreviewPhone";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";

const SITE_CONTENT_KEY = "homepage_app_preview";

const AppPreviewSection: React.FC = () => {
  const defaults = React.useMemo(() => getDefaultAppPreview(), []);
  const { value, isLoading } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);

  return (
    <section className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>See how the app looks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !value ? (
            <div className="text-muted-foreground">Loading preview...</div>
          ) : (
            <AppPreviewPhone config={value ?? defaults} />
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            This preview updates automatically when admins save changes in the App Testing page.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AppPreviewSection;
