import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { CATEGORIES, TEMPLATES } from "../data/templates";
import { generateEmail } from "../utils/emailGenerator";

const TONES = [
  "Professional",
  "Friendly",
  "Formal",
  "Casual",
  "Persuasive",
  "Empathetic",
  "Assertive",
  "Warm",
  "Apologetic",
  "Concise",
  "Urgent",
];

const LENGTHS = ["Short", "Medium", "Long"];

const STEP_LABELS = [
  "Recipient",
  "Email type",
  "Tone & length",
  "Your details",
  "Review & edit",
];

const PRONOUNS_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "Prefer not to say",
];

interface Props {
  onSignUp: () => void;
  onBack: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function renderBodyWithHighlights(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    const key = `part-${i}`;
    return part.startsWith("[") && part.endsWith("]") ? (
      <span
        key={key}
        className="text-amber-600 font-medium bg-amber-50 rounded px-0.5"
      >
        {part}
      </span>
    ) : (
      <span key={key}>{part}</span>
    );
  });
}

export default function PreviewWizard({ onSignUp, onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [context, setContext] = useState("");
  const [yourPronouns, setYourPronouns] = useState("they/them");
  const [templateId, setTemplateId] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [yourName, setYourName] = useState("");
  const [yourCompany, setYourCompany] = useState("");
  const [signOff, setSignOff] = useState("Best regards");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    const matchSearch =
      !search ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchTag = !selectedTag || t.tags.includes(selectedTag);
    return matchCategory && matchSearch && matchTag;
  });

  const generatePreviewEmail = useCallback(() => {
    if (!templateId) return;
    const result = generateEmail({
      templateId,
      recipientName: recipientName || "[Recipient Name]",
      recipientPronouns: "they/them",
      context: context || "",
      tone,
      length,
      yourName: yourName || "[Your Name]",
      yourTitle: "",
      yourCompany: yourCompany || "",
      signOff: signOff || "Best regards",
      yourPronouns,
    });
    setSubject(result.subject);
    setBody(result.body);
    setShowSignUpModal(true);
    setModalDismissed(false);
  }, [
    templateId,
    recipientName,
    yourCompany,
    context,
    tone,
    length,
    yourName,
    signOff,
    yourPronouns,
  ]);

  const handleNext = () => {
    if (step === 4) {
      generatePreviewEmail();
      setStep(5);
      return;
    }
    setStep((s) => Math.min(s + 1, 5) as 1 | 2 | 3 | 4 | 5);
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleCopy = () => {
    const full = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailto = () => {
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return !!templateId;
    if (step === 3) return !!tone && !!length;
    if (step === 4) return true;
    return true;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                data-ocid="preview.back.button"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to home</span>
              </button>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-base tracking-tight text-foreground">
                  EmailCraft
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold tracking-wide uppercase border-accent/40 text-accent-foreground bg-accent/10 px-2 py-0.5"
              >
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Preview mode
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={onSignUp}
              data-ocid="preview.header_signin.button"
              className="gap-1.5 text-xs font-semibold"
            >
              Sign in to save
            </Button>
          </div>
        </header>

        {/* Step progress */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                const isActive = s === step;
                const isDone = s < step;
                return (
                  <button
                    key={label}
                    type="button"
                    data-ocid={`preview.step.${s}`}
                    onClick={() => {
                      if (s < step || (s === step + 1 && canProceed())) {
                        setStep(s as 1 | 2 | 3 | 4 | 5);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                          ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/15"
                          : "text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center border border-current text-[9px] font-bold">
                        {s}
                      </span>
                    )}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
                className="max-w-xl mx-auto space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Who are you writing to?
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Recipient details help personalise the email.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="recipient-name">Recipient name</Label>
                    <Input
                      id="recipient-name"
                      data-ocid="preview.recipient_name.input"
                      placeholder="e.g. Sarah Johnson"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recipient-company">
                      Their company (optional)
                    </Label>
                    <Input
                      id="recipient-company"
                      data-ocid="preview.recipient_company.input"
                      placeholder="e.g. Acme Corp"
                      value={recipientCompany}
                      onChange={(e) => setRecipientCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="your-pronouns">Your pronouns</Label>
                    <Select
                      value={yourPronouns}
                      onValueChange={setYourPronouns}
                    >
                      <SelectTrigger
                        id="your-pronouns"
                        data-ocid="preview.your_pronouns.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRONOUNS_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="context">
                      Context or purpose (optional)
                    </Label>
                    <Textarea
                      id="context"
                      data-ocid="preview.context.textarea"
                      placeholder="Brief context — e.g. 'following up on last Tuesday's call about the Q4 proposal'"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="resize-none h-20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Choose your email type
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    216 templates across 15 categories.
                  </p>
                </div>

                {/* Search & filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      data-ocid="preview.template_search.search_input"
                      placeholder="Search templates…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {["All", ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      data-ocid="preview.category.toggle"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedTag(null);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Active tag filter */}
                {selectedTag && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tag:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag(null)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-foreground text-xs font-medium hover:bg-accent/20 transition-colors"
                    >
                      #{selectedTag}
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Template grid — no fixed height, scrolls naturally */}
                <div className="pr-2">
                  {filteredTemplates.length === 0 ? (
                    <div
                      data-ocid="preview.templates.empty_state"
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No templates match your search.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          data-ocid="preview.template.button"
                          onClick={() => setTemplateId(t.id)}
                          className={cn(
                            "text-left p-4 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
                            templateId === t.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-primary/40",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {t.label}
                            </p>
                            {templateId === t.id && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-2.5">
                            {t.category}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {t.tags.slice(0, 3).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setSelectedCategory("All");
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-800 cursor-pointer transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
                className="max-w-xl mx-auto space-y-8"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Set tone &amp; length
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    The same template, rewritten for your voice.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Tone</Label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        data-ocid="preview.tone.toggle"
                        onClick={() => setTone(t)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                          tone === t
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Length</Label>
                  <div className="flex gap-3">
                    {LENGTHS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        data-ocid="preview.length.toggle"
                        onClick={() => setLength(l)}
                        className={cn(
                          "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all",
                          length === l
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
                className="max-w-xl mx-auto space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Your details
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    These appear in your email signature. Save them by creating
                    a free account.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="your-name">Your name</Label>
                    <Input
                      id="your-name"
                      data-ocid="preview.your_name.input"
                      placeholder="Your Name"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="your-company">
                      Your company (optional)
                    </Label>
                    <Input
                      id="your-company"
                      data-ocid="preview.your_company.input"
                      placeholder="e.g. Acme Corp"
                      value={yourCompany}
                      onChange={(e) => setYourCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sign-off">Sign-off</Label>
                    <Input
                      id="sign-off"
                      data-ocid="preview.signoff.input"
                      placeholder="Best regards"
                      value={signOff}
                      onChange={(e) => setSignOff(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      e.g. Best regards, Warm regards, Thanks, Cheers
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm text-foreground/80">
                    <span className="font-semibold text-accent-foreground">
                      💡 Tip:
                    </span>{" "}
                    Create a free account to save your details so they auto-fill
                    every time.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
                className="max-w-2xl mx-auto space-y-5"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Your email is ready
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Review, edit, and copy. Sign up to save it.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Input
                      data-ocid="preview.subject.input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Body</Label>
                      <button
                        type="button"
                        onClick={() => setHighlightMode((h) => !h)}
                        data-ocid="preview.highlight_toggle.toggle"
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                          highlightMode
                            ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
                        )}
                      >
                        {highlightMode ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {highlightMode
                          ? "Stop highlighting"
                          : "Highlight placeholders"}
                      </button>
                    </div>
                    {highlightMode ? (
                      <div
                        data-ocid="preview.body.editor"
                        className="min-h-[360px] w-full rounded-md border border-border bg-card px-4 py-3 text-sm font-mono whitespace-pre-wrap leading-relaxed"
                      >
                        {renderBodyWithHighlights(body)}
                      </div>
                    ) : (
                      <Textarea
                        data-ocid="preview.body.editor"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[360px] font-mono text-sm leading-relaxed resize-y"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleCopy}
                    data-ocid="preview.copy.button"
                    className={cn(
                      "gap-2 font-semibold",
                      copied && "bg-green-600 hover:bg-green-700",
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied to clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy email
                      </>
                    )}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleMailto}
                        data-ocid="preview.mail.button"
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSignUpModal(true);
                      setModalDismissed(false);
                    }}
                    data-ocid="preview.save_prompt.button"
                    className="gap-2 font-semibold border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Sparkles className="w-4 h-4" />
                    Save this email
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 5 && (
            <div className="max-w-4xl mx-auto mt-8 flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={step === 1 ? onBack : handleBack}
                data-ocid="preview.nav_back.button"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 1 ? "Back to home" : "Back"}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                data-ocid="preview.nav_next.button"
                className="gap-2 font-semibold"
              >
                {step === 4 ? "Generate email" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          {step === 5 && (
            <div className="max-w-4xl mx-auto mt-8 flex items-center justify-start pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                data-ocid="preview.step5_back.button"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          )}
        </main>

        {/* Sign-up modal */}
        <Dialog
          open={showSignUpModal && !modalDismissed}
          onOpenChange={(open) => {
            if (!open) setModalDismissed(true);
          }}
        >
          <DialogContent
            data-ocid="preview.signup_modal.dialog"
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold">
                Save your email and access your full history
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-relaxed">
                Create a free account to save this email, access 216 templates,
                and keep your history across devices.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2">
                {[
                  "Save all your generated emails",
                  "Auto-fill your name & sign-off",
                  "Access full history across devices",
                  "No password · No credit card",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={onSignUp}
                data-ocid="preview.signup.primary_button"
                className="w-full gap-2 font-semibold h-11"
                size="lg"
              >
                <ArrowRight className="w-4 h-4" />
                Create free account
              </Button>

              <Button
                variant="ghost"
                onClick={() => setModalDismissed(true)}
                data-ocid="preview.signup.cancel_button"
                className="w-full text-muted-foreground hover:text-foreground text-sm"
              >
                Continue without saving
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
