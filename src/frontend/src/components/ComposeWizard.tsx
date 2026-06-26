import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { EmailEntry } from "../backend.d";
import { CATEGORIES, TEMPLATES, type Template } from "../data/templates";
import { useSaveEmail, useSettings } from "../hooks/useQueries";
import { generateEmail } from "../utils/emailGenerator";

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

const LENGTHS = ["Short", "Medium", "Long"];

const RECIPIENT_PRONOUNS = ["she/her", "he/him", "they/them", "don't specify"];
const YOUR_PRONOUNS = ["she/her", "he/him", "they/them", "custom"];

interface WizardState {
  recipientName: string;
  recipientPronouns: string;
  context: string;
  templateId: string;
  tone: string;
  length: string;
  yourName: string;
  yourTitle: string;
  yourCompany: string;
  yourPronouns: string;
  yourPronounsCustom: string;
  signOff: string;
  subject: string;
  body: string;
}

const DEFAULT_STATE: WizardState = {
  recipientName: "",
  recipientPronouns: "they/them",
  context: "",
  templateId: "",
  tone: "Professional",
  length: "Medium",
  yourName: "",
  yourTitle: "",
  yourCompany: "",
  yourPronouns: "they/them",
  yourPronounsCustom: "",
  signOff: "Best regards",
  subject: "",
  body: "",
};

const STEP_LABELS = [
  "Recipient",
  "Email type",
  "Tone & length",
  "Your details",
  "Review & edit",
];

interface Props {
  loadedEntry?: EmailEntry | null;
  onLoadConsumed?: () => void;
}

function renderBodyWithHighlights(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    const key = `part-${i}`;
    return part.startsWith("[") && part.endsWith("]") ? (
      <span key={key} className="text-amber-600 font-medium">
        {part}
      </span>
    ) : (
      <span key={key}>{part}</span>
    );
  });
}

export default function ComposeWizard({ loadedEntry, onLoadConsumed }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [wizard, setWizard] = useState<WizardState>(DEFAULT_STATE);
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadedFromHistory, setLoadedFromHistory] = useState(false);
  const [historyBannerDismissed, setHistoryBannerDismissed] = useState(false);
  const { data: settings } = useSettings();
  const saveEmail = useSaveEmail();

  // Sync settings into wizard defaults
  useEffect(() => {
    if (settings) {
      setWizard((w) => ({
        ...w,
        yourName: w.yourName || settings.fullName || "",
        yourTitle: w.yourTitle || settings.jobTitle || "",
        yourCompany: w.yourCompany || settings.company || "",
        signOff:
          w.signOff !== "Best regards"
            ? w.signOff
            : settings.signOff || "Best regards",
        tone:
          w.tone !== "Professional"
            ? w.tone
            : settings.defaultTone || "Professional",
        yourPronouns:
          w.yourPronouns !== "they/them"
            ? w.yourPronouns
            : settings.defaultPronouns || "they/them",
      }));
    }
  }, [settings]);

  const consumeLoaded = useCallback(() => {
    onLoadConsumed?.();
  }, [onLoadConsumed]);

  // Load from history
  useEffect(() => {
    if (loadedEntry) {
      setWizard((w) => ({
        ...w,
        recipientName: loadedEntry.recipientName,
        tone: loadedEntry.tone,
        subject: loadedEntry.subject,
        body: loadedEntry.emailBody,
      }));
      setStep(5);
      setLoadedFromHistory(true);
      setHistoryBannerDismissed(false);
      consumeLoaded();
    }
  }, [loadedEntry, consumeLoaded]);

  const set = (k: keyof WizardState, v: string) =>
    setWizard((w) => ({ ...w, [k]: v }));

  // Determine if a step's requirements are met (for forward nav)
  const stepComplete = (n: number): boolean => {
    if (n === 1) return wizard.recipientName.trim() !== "";
    if (n === 2) return wizard.templateId !== "";
    if (n === 3) return true;
    if (n === 4) return true;
    return false;
  };

  const canNavigateTo = (num: number): boolean => {
    if (num === step) return false;
    if (num < step) return true;
    // Forward: all steps from current up to (num-1) must be complete
    for (let i = step; i < num; i++) {
      if (!stepComplete(i)) return false;
    }
    return true;
  };

  const goToStep = (n: 1 | 2 | 3 | 4 | 5) => {
    if (canNavigateTo(n)) setStep(n);
  };

  const generateAndAdvance = () => {
    const result = generateEmail({
      templateId: wizard.templateId,
      recipientName: wizard.recipientName,
      recipientPronouns: wizard.recipientPronouns,
      context: wizard.context,
      tone: wizard.tone,
      length: wizard.length,
      yourName: wizard.yourName,
      yourTitle: wizard.yourTitle,
      yourCompany: wizard.yourCompany,
      signOff: wizard.signOff,
      yourPronouns:
        wizard.yourPronouns !== "custom"
          ? wizard.yourPronouns
          : wizard.yourPronounsCustom,
    });
    setWizard((w) => ({ ...w, subject: result.subject, body: result.body }));
    setStep(5);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wizard.body);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      await saveEmail.mutateAsync({
        subject: wizard.subject,
        recipientName: wizard.recipientName,
        tone: wizard.tone,
        emailBody: wizard.body,
      });
      toast.success("Saved to history");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleMailto = () => {
    const url = `mailto:?subject=${encodeURIComponent(wizard.subject)}&body=${encodeURIComponent(wizard.body)}`;
    window.open(url);
  };

  const handleClear = () => {
    setWizard(DEFAULT_STATE);
    setStep(1);
    setPreviewMode(false);
    setLoadedFromHistory(false);
  };

  // Filtered templates for step 2
  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.label.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || t.tags.includes(selectedTag);
    return matchesCategory && matchesSearch && matchesTag;
  });

  const visibleCategories =
    selectedCategory === "All"
      ? CATEGORIES.filter((cat) =>
          filteredTemplates.some((t) => t.category === cat),
        )
      : [selectedCategory];

  return (
    <TooltipProvider>
      <div className="max-w-3xl mx-auto">
        {/* History loaded banner */}
        {loadedFromHistory && !historyBannerDismissed && (
          <div
            data-ocid="compose.history_banner.panel"
            className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="flex-1">
              You&apos;re editing a saved email. Use the step bar to go back and
              make changes.
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setHistoryBannerDismissed(true)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
          {STEP_LABELS.map((label, i) => {
            const num = (i + 1) as 1 | 2 | 3 | 4 | 5;
            const isCompleted = num < step;
            const isActive = num === step;
            const canNav = canNavigateTo(num);
            return (
              <div key={num} className="flex items-center">
                <button
                  type="button"
                  data-ocid={`wizard.step.${num}`}
                  onClick={() => (canNav ? goToStep(num) : undefined)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 transition-opacity",
                    canNav
                      ? "cursor-pointer opacity-100"
                      : isActive
                        ? "opacity-100"
                        : "opacity-40 cursor-not-allowed",
                  )}
                  disabled={!canNav && !isActive}
                >
                  <span
                    className={cn(
                      "step-indicator",
                      isCompleted
                        ? "completed"
                        : isActive
                          ? "active"
                          : "upcoming",
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : num}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </button>
                {i < 4 && (
                  <div
                    className={cn(
                      "h-px w-8 mt-[-12px] transition-colors",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Who are you emailing?</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tell us about the recipient so we can personalise your
                    email.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">
                      Recipient&apos;s name
                    </Label>
                    <Input
                      id="recipient-name"
                      data-ocid="step1.recipient_name.input"
                      value={wizard.recipientName}
                      onChange={(e) => set("recipientName", e.target.value)}
                      placeholder="e.g. Alex, Dr. Smith, Sarah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Their pronouns</Label>
                    <Select
                      value={wizard.recipientPronouns}
                      onValueChange={(v) => set("recipientPronouns", v)}
                    >
                      <SelectTrigger data-ocid="step1.recipient_pronouns.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECIPIENT_PRONOUNS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="context">
                      Relationship / context{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="context"
                      data-ocid="step1.context.textarea"
                      value={wizard.context}
                      onChange={(e) => set("context", e.target.value)}
                      placeholder="e.g. colleague I met last week, potential client in fintech, old university friend"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    data-ocid="wizard.next.button"
                    onClick={() => setStep(2)}
                    disabled={!wizard.recipientName.trim()}
                    className="gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">What kind of email?</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose from {TEMPLATES.length}+ templates across{" "}
                    {CATEGORIES.length} categories.
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    data-ocid="step2.search.input"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedTag(null);
                    }}
                    placeholder="Search templates..."
                    className="pl-9"
                  />
                </div>

                {/* Active tag filter banner */}
                {selectedTag && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Filtered by tag:</span>
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      #{selectedTag}
                      <button
                        type="button"
                        data-ocid="step2.tag_clear.button"
                        onClick={() => setSelectedTag(null)}
                        className="ml-0.5 hover:text-primary/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Category filter pills */}
                <div className="flex flex-wrap gap-2">
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      data-ocid="step2.category_filter.tab"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSearch("");
                        setSelectedTag(null);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Tag hint */}
                <p className="text-xs text-muted-foreground -mb-2">
                  <span className="inline-flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Click a tag to filter by topic
                  </span>
                </p>

                {/* Template grid by category */}
                <div className="space-y-5">
                  {filteredTemplates.length === 0 ? (
                    <div
                      data-ocid="step2.templates.empty_state"
                      className="text-center py-10 text-muted-foreground text-sm"
                    >
                      {search
                        ? `No templates match "${search}".`
                        : "No templates match the current filter."}
                    </div>
                  ) : (
                    visibleCategories.map((cat) => {
                      const catTemplates = filteredTemplates.filter(
                        (t) => t.category === cat,
                      );
                      if (catTemplates.length === 0) return null;
                      return (
                        <div key={cat}>
                          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                            {cat}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {catTemplates.map((t) => {
                              const globalIndex =
                                TEMPLATES.findIndex((x) => x.id === t.id) + 1;
                              return (
                                <button
                                  type="button"
                                  key={t.id}
                                  data-ocid={`step2.template.item.${globalIndex}`}
                                  onClick={() => {
                                    set("templateId", t.id);
                                  }}
                                  className={cn(
                                    "text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150 flex flex-col gap-1.5",
                                    wizard.templateId === t.id
                                      ? "border-primary bg-primary/8 text-primary"
                                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
                                  )}
                                >
                                  <span>{t.label}</span>
                                  <div className="flex flex-wrap gap-1">
                                    {t.tags.map((tag) => (
                                      <button
                                        type="button"
                                        key={tag}
                                        data-ocid="step2.tag.button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTag(
                                            tag === selectedTag ? null : tag,
                                          );
                                          setSelectedCategory("All");
                                          setSearch("");
                                        }}
                                        className={cn(
                                          "text-[10px] px-1.5 py-0.5 rounded font-normal cursor-pointer transition-colors",
                                          selectedTag === tag
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-800",
                                        )}
                                      >
                                        #{tag}
                                      </button>
                                    ))}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Next button + hint */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      data-ocid="wizard.back.button"
                      onClick={() => setStep(1)}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        data-ocid="wizard.next.button"
                        onClick={() => setStep(3)}
                        disabled={!wizard.templateId}
                        className="gap-2"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Or click a template to select and continue
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Tone &amp; length</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose how your email should sound and how long it should
                    be.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Tone</Label>
                    <div className="flex flex-wrap gap-2">
                      {TONES.map((t, i) => (
                        <button
                          type="button"
                          key={t}
                          data-ocid={`step3.tone.item.${i + 1}`}
                          onClick={() => set("tone", t)}
                          className={cn(
                            "tone-chip",
                            wizard.tone === t && "active",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <Select
                      value={wizard.length}
                      onValueChange={(v) => set("length", v)}
                    >
                      <SelectTrigger
                        data-ocid="step3.length.select"
                        className="w-40"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LENGTHS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    data-ocid="wizard.back.button"
                    onClick={() => setStep(2)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    data-ocid="wizard.next.button"
                    onClick={() => setStep(4)}
                    className="gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold">Your details</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Pre-filled from your settings. Edit for this email only.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Your full name</Label>
                    <Input
                      value={wizard.yourName}
                      onChange={(e) => set("yourName", e.target.value)}
                      placeholder="e.g. Alex Johnson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job title</Label>
                    <Input
                      value={wizard.yourTitle}
                      onChange={(e) => set("yourTitle", e.target.value)}
                      placeholder="e.g. Product Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={wizard.yourCompany}
                      onChange={(e) => set("yourCompany", e.target.value)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sign-off</Label>
                    <Input
                      value={wizard.signOff}
                      onChange={(e) => set("signOff", e.target.value)}
                      placeholder="e.g. Best regards"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your pronouns</Label>
                    <Select
                      value={wizard.yourPronouns}
                      onValueChange={(v) => set("yourPronouns", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YOUR_PRONOUNS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {wizard.yourPronouns === "custom" && (
                      <Input
                        value={wizard.yourPronounsCustom}
                        onChange={(e) =>
                          set("yourPronounsCustom", e.target.value)
                        }
                        placeholder="Enter your pronouns"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    data-ocid="wizard.back.button"
                    onClick={() => setStep(3)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    data-ocid="wizard.next.button"
                    onClick={generateAndAdvance}
                    className="gap-2"
                  >
                    Generate email <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Review &amp; edit</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Edit the generated email, then copy or send it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject line</Label>
                  <Input
                    id="subject"
                    data-ocid="step5.subject.input"
                    value={wizard.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    className="font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Email body</Label>
                    <button
                      type="button"
                      onClick={() => setPreviewMode((p) => !p)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                        previewMode
                          ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                      )}
                      data-ocid="step5.highlight_toggle.toggle"
                    >
                      {previewMode ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {previewMode
                        ? "Stop highlighting"
                        : "Highlight placeholders"}
                    </button>
                  </div>

                  {previewMode ? (
                    <div
                      data-ocid="step5.body.editor"
                      className="min-h-[340px] w-full rounded-md border border-border bg-card px-4 py-3 text-sm font-mono whitespace-pre-wrap leading-relaxed"
                    >
                      {renderBodyWithHighlights(wizard.body)}
                    </div>
                  ) : (
                    <Textarea
                      data-ocid="step5.body.editor"
                      value={wizard.body}
                      onChange={(e) => set("body", e.target.value)}
                      rows={16}
                      className="font-mono text-sm leading-relaxed resize-y"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    data-ocid="step5.copy.button"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    data-ocid="step5.save.button"
                    variant="outline"
                    onClick={handleSave}
                    disabled={saveEmail.isPending}
                    className="gap-2"
                  >
                    {saveEmail.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save to history
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        data-ocid="step5.mail.button"
                        variant="outline"
                        onClick={handleMailto}
                        className="gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Open in mail
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Opens a pre-filled draft in your default email client.
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid="step5.clear.button"
                        variant="ghost"
                        className="gap-2 text-muted-foreground ml-auto"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Clear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="compose.clear_confirm.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset composer?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset all steps and clear your email. This
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="compose.clear_confirm.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="compose.clear_confirm.confirm_button"
                          onClick={handleClear}
                        >
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex justify-start pt-1">
                  <Button
                    variant="outline"
                    data-ocid="wizard.back.button"
                    onClick={() => setStep(4)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Edit details
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
