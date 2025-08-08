
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import AppPreviewPhone from "@/components/app-preview/AppPreviewPhone";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, AppPreviewCard, getDefaultAppPreview } from "@/types/appPreview";
import { useToast } from "@/components/ui/use-toast";

const SITE_CONTENT_KEY = "homepage_app_preview";

const AppTestingPage: React.FC = () => {
  const defaults = useMemo(() => getDefaultAppPreview(), []);
  const { toast } = useToast();

  const { value, isLoading, save, isSaving } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);

  const [draft, setDraft] = useState<AppPreviewConfig>(value ?? defaults);

  React.useEffect(() => {
    if (value) setDraft(value);
  }, [value]);

  const handleField = (field: keyof AppPreviewConfig, val: string) => {
    setDraft((d) => ({ ...d, [field]: val }));
  };

  const updateCard = (index: number, patch: Partial<AppPreviewCard>) => {
    setDraft((d) => {
      const next = [...(d.cards ?? [])];
      next[index] = { ...next[index], ...patch };
      return { ...d, cards: next };
    });
  };

  const addCard = () => {
    setDraft((d) => ({
      ...d,
      cards: [
        ...(d.cards ?? []),
        { icon: "heart", title: "New Card", status: "Info", description: "Description" },
      ],
    }));
  };

  const removeCard = (index: number) => {
    setDraft((d) => {
      const next = [...(d.cards ?? [])];
      next.splice(index, 1);
      return { ...d, cards: next };
    });
  };

  const onSave = () => {
    save(draft, {
      onSuccess: () => {
        toast({ title: "Saved", description: "Homepage preview updated." });
      },
      onError: (err: any) => {
        toast({ title: "Save failed", description: err?.message ?? "Please try again." });
      },
    });
  };

  const onReset = () => {
    const df = getDefaultAppPreview();
    setDraft(df);
    toast({ title: "Reset", description: "Defaults restored. Click Save to persist." });
  };

  if (isLoading && !value) {
    return <div className="p-6 text-muted-foreground">Loading App Testing...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Live preview */}
        <div className="w-full lg:w-5/12">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>App Visual Preview</CardTitle>
              <div className="flex items-center gap-2">
                <span className="relative inline-flex">
                  <span className="h-3.5 w-3.5 rounded-full bg-[hsl(var(--emergency))] shadow-[0_0_12px_hsl(var(--emergency)/0.8)]"></span>
                  <span className="absolute inset-0 rounded-full emergency-pulse"></span>
                </span>
                <span className="text-xs font-medium text-muted-foreground">Live</span>
              </div>
            </CardHeader>
            <CardContent>
              <AppPreviewPhone config={draft} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Editor */}
        <div className="w-full lg:w-7/12">
          <Card>
            <CardHeader>
              <CardTitle>Customize Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="appName">App Name</Label>
                  <Input id="appName" value={draft.appName} onChange={(e) => handleField("appName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={draft.tagline} onChange={(e) => handleField("tagline", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sosLabel">SOS Label</Label>
                  <Input id="sosLabel" value={draft.sosLabel} onChange={(e) => handleField("sosLabel", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sosSubLabel">SOS Sub Label</Label>
                  <Input id="sosSubLabel" value={draft.sosSubLabel} onChange={(e) => handleField("sosSubLabel", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="voiceLabel">Voice Label</Label>
                  <Input id="voiceLabel" value={draft.voiceLabel} onChange={(e) => handleField("voiceLabel", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" type="text" placeholder="#ef4444" value={draft.primaryColor ?? ""} onChange={(e) => handleField("primaryColor", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sosColor">SOS Button Color</Label>
                  <Input id="sosColor" type="text" placeholder="#22c55e" value={draft.sosColor ?? ""} onChange={(e) => handleField("sosColor", e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Cards</h4>
                <Button size="sm" variant="secondary" onClick={addCard}>
                  <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
              </div>

              <div className="space-y-3">
                {(draft.cards ?? []).map((card, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-medium">Card {idx + 1}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeCard(idx)} aria-label="Remove card">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <Label>Title</Label>
                        <Input value={card.title} onChange={(e) => updateCard(idx, { title: e.target.value })} />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Input value={card.status} onChange={(e) => updateCard(idx, { status: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input value={card.description} onChange={(e) => updateCard(idx, { description: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Icon (text)</Label>
                        <Input value={card.icon} onChange={(e) => updateCard(idx, { icon: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={onSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={onReset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppTestingPage;
