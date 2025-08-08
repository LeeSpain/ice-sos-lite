
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppPreviewConfig } from "@/types/appPreview";

type Props = {
  config: AppPreviewConfig;
  className?: string;
};

const AppPreviewPhone: React.FC<Props> = ({ config, className }) => {
  return (
    <div className={className}>
      <div className="mx-auto w-full max-w-sm">
        <Card className="relative mx-auto w-full rounded-[2.25rem] border-border bg-card p-4 shadow-xl">
          {/* Notch */}
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground/10" />

          {/* Screen */}
          <div className="rounded-[1.75rem] border border-border bg-background p-4">
            {/* Header */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Preview</div>
              <h3 className="mt-1 text-xl font-semibold">{config.appName}</h3>
              <p className="text-xs text-muted-foreground">{config.tagline}</p>
            </div>

            <Separator className="my-4" />

            {/* SOS button */}
            <div className="flex flex-col items-center gap-2 py-6">
              <Button
                type="button"
                disabled
                className="h-24 w-24 rounded-full text-foreground shadow-lg"
                style={{
                  background:
                    config.sosColor
                      ? config.sosColor
                      : "hsl(var(--primary))",
                }}
              >
                <span className="text-center text-sm font-bold leading-tight">
                  {config.sosLabel}
                </span>
              </Button>
              <div className="text-xs text-muted-foreground">{config.sosSubLabel}</div>
              <div className="mt-1 rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                {config.voiceLabel}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Cards */}
            <div className="grid grid-cols-1 gap-3">
              {config.cards?.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.status}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.description}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppPreviewPhone;
