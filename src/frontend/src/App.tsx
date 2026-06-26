import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  History,
  Loader2,
  LogOut,
  Mail,
  PenLine,
  Settings,
} from "lucide-react";
import { useState } from "react";
import type { EmailEntry } from "./backend.d";
import ComposeWizard from "./components/ComposeWizard";
import HistorySection from "./components/HistorySection";
import LandingPage from "./components/LandingPage";
import PreviewWizard from "./components/PreviewWizard";
import SettingsSection from "./components/SettingsSection";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Section = "compose" | "history" | "settings";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const [section, setSection] = useState<Section>("compose");
  const [loadedEntry, setLoadedEntry] = useState<EmailEntry | null>(null);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<Section | null>(null);

  const handleSectionChange = (next: Section) => {
    if (section === "settings" && settingsDirty && next !== "settings") {
      setPendingSection(next);
    } else {
      setSection(next);
    }
  };

  const isLoggingIn = loginStatus === "logging-in";
  const [previewMode, setPreviewMode] = useState(false);

  const handleLoadEntry = (entry: EmailEntry) => {
    setLoadedEntry(entry);
    setSection("compose");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!identity && !previewMode) {
    return (
      <LandingPage
        login={login}
        isLoggingIn={isLoggingIn}
        onTryFree={() => setPreviewMode(true)}
      />
    );
  }

  if (!identity && previewMode) {
    return (
      <PreviewWizard onSignUp={login} onBack={() => setPreviewMode(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster />

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">
              EmailCraft
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="compose.link"
              onClick={() => handleSectionChange("compose")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                section === "compose"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <PenLine className="w-4 h-4" />
              Compose
            </button>
            <button
              type="button"
              data-ocid="history.link"
              onClick={() => handleSectionChange("history")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                section === "history"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              type="button"
              data-ocid="settings.link"
              onClick={() => handleSectionChange("settings")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                section === "settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              data-ocid="logout.button"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        {section === "compose" && (
          <ComposeWizard
            loadedEntry={loadedEntry}
            onLoadConsumed={() => setLoadedEntry(null)}
          />
        )}
        {section === "history" && <HistorySection onLoad={handleLoadEntry} />}
        {section === "settings" && (
          <SettingsSection onDirtyChange={setSettingsDirty} />
        )}

        {/* Settings dirty-state navigation warning */}
        <AlertDialog
          open={!!pendingSection}
          onOpenChange={(open) => {
            if (!open) setPendingSection(null);
          }}
        >
          <AlertDialogContent data-ocid="settings.unsaved_changes.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes in Settings. Leave without saving?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="settings.unsaved_changes.cancel_button"
                onClick={() => setPendingSection(null)}
              >
                Stay
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="settings.unsaved_changes.confirm_button"
                onClick={() => {
                  if (pendingSection) {
                    setSection(pendingSection);
                    setPendingSection(null);
                    setSettingsDirty(false);
                  }
                }}
              >
                Leave without saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
