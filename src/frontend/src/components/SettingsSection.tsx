import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSaveSettings, useSettings } from "../hooks/useQueries";

const TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Warm",
  "Direct",
  "Assertive",
  "Empathetic",
  "Enthusiastic",
  "Apologetic",
  "Diplomatic",
];

const PRONOUNS_OPTIONS = ["she/her", "he/him", "they/them", "custom"];

interface Props {
  onDirtyChange?: (dirty: boolean) => void;
}

export default function SettingsSection({ onDirtyChange }: Props) {
  const { data: settings, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const [form, setForm] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    signOff: "Best regards",
    defaultTone: "Professional",
    defaultPronouns: "they/them",
    customPronouns: "",
  });
  const [savedForm, setSavedForm] = useState(form);

  useEffect(() => {
    if (settings) {
      const loaded = {
        fullName: settings.fullName || "",
        jobTitle: settings.jobTitle || "",
        company: settings.company || "",
        signOff: settings.signOff || "Best regards",
        defaultTone: settings.defaultTone || "Professional",
        defaultPronouns: PRONOUNS_OPTIONS.includes(
          settings.defaultPronouns || "",
        )
          ? settings.defaultPronouns || "they/them"
          : "custom",
        customPronouns: PRONOUNS_OPTIONS.includes(
          settings.defaultPronouns || "",
        )
          ? ""
          : settings.defaultPronouns || "",
      };
      setForm(loaded);
      setSavedForm(loaded);
    }
  }, [settings]);

  const isDirty =
    form.fullName !== savedForm.fullName ||
    form.jobTitle !== savedForm.jobTitle ||
    form.company !== savedForm.company ||
    form.signOff !== savedForm.signOff ||
    form.defaultTone !== savedForm.defaultTone ||
    form.defaultPronouns !== savedForm.defaultPronouns ||
    form.customPronouns !== savedForm.customPronouns;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const pronounsValue =
      form.defaultPronouns === "custom"
        ? form.customPronouns || "they/them"
        : form.defaultPronouns;
    try {
      await saveSettings.mutateAsync({
        fullName: form.fullName,
        jobTitle: form.jobTitle,
        company: form.company,
        signOff: form.signOff,
        defaultTone: form.defaultTone,
        defaultPronouns: pronounsValue,
      });
      setSavedForm(form);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-48"
        data-ocid="settings.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Your details are pre-filled into every email you compose.
        </p>
        {isDirty && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            You have unsaved changes.
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full name</Label>
            <Input
              id="settings-name"
              data-ocid="settings.name.input"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="e.g. Alex Johnson"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-title">Job title / role</Label>
            <Input
              id="settings-title"
              data-ocid="settings.title.input"
              value={form.jobTitle}
              onChange={(e) => setField("jobTitle", e.target.value)}
              placeholder="e.g. Product Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-company">Company / organisation</Label>
            <Input
              id="settings-company"
              data-ocid="settings.company.input"
              value={form.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-signoff">Preferred sign-off</Label>
            <Input
              id="settings-signoff"
              data-ocid="settings.signoff.input"
              value={form.signOff}
              onChange={(e) => setField("signOff", e.target.value)}
              placeholder="e.g. Best regards"
            />
          </div>
        </div>

        {/* Tone pills */}
        <div className="space-y-2">
          <Label>Default tone</Label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                data-ocid="settings.tone.toggle"
                onClick={() => setField("defaultTone", t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  form.defaultTone === t
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Pronouns */}
        <div className="space-y-2">
          <Label>Your pronouns</Label>
          <div className="flex flex-wrap gap-2">
            {PRONOUNS_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                data-ocid="settings.pronouns.toggle"
                onClick={() => setField("defaultPronouns", p)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all",
                  form.defaultPronouns === p
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {p === "custom" ? "Custom" : p}
              </button>
            ))}
          </div>
          {form.defaultPronouns === "custom" && (
            <Input
              data-ocid="settings.custom_pronouns.input"
              value={form.customPronouns}
              onChange={(e) => setField("customPronouns", e.target.value)}
              placeholder="Enter your pronouns"
              className="mt-2 max-w-xs"
            />
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saveSettings.isPending}
            data-ocid="settings.save.button"
            className="gap-2"
          >
            {saveSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSettings.isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
