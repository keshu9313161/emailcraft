import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers, Loader2, Mail, Target, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Brand constants ──────────────────────────────────────────────────────────
const PRIMARY = "oklch(0.26 0.075 258)";
const ACCENT = "oklch(0.78 0.16 65)";

// ── Category data ────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Professional",
  "Sales",
  "HR",
  "Customer Service",
  "Personal",
  "Academic",
  "Real Estate",
  "Healthcare",
  "Non-profit",
  "Tech & IT",
  "Finance & Legal",
  "Executive",
  "Operations",
  "Education",
  "Creative",
];

const CategoryPill = ({ cat, prefix }: { cat: string; prefix: string }) => (
  <span
    key={`${prefix}-${cat}`}
    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground whitespace-nowrap select-none"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-accent/70 flex-shrink-0" />
    {cat}
  </span>
);

export function CategoryStrip() {
  return (
    <div className="w-full overflow-hidden relative" aria-hidden="true">
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex gap-2 animate-marquee"
        style={{ width: "max-content" }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill key={`a-${cat}`} cat={cat} prefix="a" />
        ))}
        {CATEGORIES.map((cat) => (
          <CategoryPill key={`b-${cat}`} cat={cat} prefix="b" />
        ))}
      </div>
    </div>
  );
}

// ── Email samples for typing animation ───────────────────────────────────────
const EMAIL_SAMPLES = [
  {
    to: "sarah.chen@acmecorp.com",
    subject: "Following up on our proposal",
    body: `Hi Sarah,

I wanted to follow up on the proposal we sent last Tuesday. We've had strong results with similar implementations — typically a 35% reduction in response time within the first quarter.

Would you have 20 minutes this week to walk through any questions?

Best regards,
Mark`,
  },
  {
    to: "james.wu@startupco.io",
    subject: "Offer Letter — Senior Product Designer",
    body: `Dear James,

We're thrilled to extend an offer for the Senior Product Designer role at StartupCo. Your portfolio stood out — particularly your systems-level thinking on the Aria redesign.

The offer includes a competitive base, equity, and full benefits. Details are attached.

We'd love to have you on board. Let me know if you have questions.

Warm regards,
Priya`,
  },
  {
    to: "support@retailbrand.com",
    subject: "Re: Order #84921 — Resolution",
    body: `Hi there,

I'm sorry for the delay with your order. This isn't the experience we want for our customers.

I've arranged an expedited replacement at no cost — you'll receive a confirmation shortly. As a thank-you for your patience, I've added a 20% discount to your account.

Please don't hesitate to reach back out.

Sincerely,
Customer Care Team`,
  },
  {
    to: "dr.patel@medcenter.org",
    subject: "Request for patient referral",
    body: `Dear Dr. Patel,

I'm writing to request a referral for my patient, Mr. David Torres, who has been experiencing recurring migraines resistant to first-line treatment.

Given your expertise in neurology, I believe a specialist consultation would be highly beneficial.

I've attached his recent labs and imaging. Please let me know your availability.

Respectfully,
Dr. Lisa Nguyen`,
  },
];

// ── Typing animation component ────────────────────────────────────────────────
function TypingEmailCard() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [phase, setPhase] = useState<"subject" | "body" | "done" | "fade">(
    "subject",
  );
  const [displayedSubject, setDisplayedSubject] = useState("");
  const [displayedBody, setDisplayedBody] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sample = EMAIL_SAMPLES[sampleIndex];

  const clearTO = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    clearTO();
    setDisplayedSubject("");
    setDisplayedBody("");
    setPhase("subject");
  }, [clearTO]);

  // Type subject
  useEffect(() => {
    if (phase !== "subject") return;
    if (displayedSubject.length < sample.subject.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedSubject(
          sample.subject.slice(0, displayedSubject.length + 1),
        );
      }, 38);
    } else {
      timeoutRef.current = setTimeout(() => setPhase("body"), 300);
    }
    return clearTO;
  }, [phase, displayedSubject, sample.subject, clearTO]);

  // Type body
  useEffect(() => {
    if (phase !== "body") return;
    if (displayedBody.length < sample.body.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedBody(sample.body.slice(0, displayedBody.length + 1));
      }, 18);
    } else {
      timeoutRef.current = setTimeout(() => setPhase("done"), 2000);
    }
    return clearTO;
  }, [phase, displayedBody, sample.body, clearTO]);

  // Fade out then cycle
  useEffect(() => {
    if (phase !== "done") return;
    timeoutRef.current = setTimeout(() => {
      setPhase("fade");
      timeoutRef.current = setTimeout(() => {
        setSampleIndex((i) => (i + 1) % EMAIL_SAMPLES.length);
      }, 500);
    }, 1500);
    return clearTO;
  }, [phase, clearTO]);

  const showCursor = phase === "subject" || phase === "body";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sampleIndex}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: phase === "fade" ? 0 : 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] mx-auto"
      >
        {/* Email client card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden border border-border/60"
          style={{ background: "oklch(0.98 0.004 250)" }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: PRIMARY }}
          >
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white/20" />
              <span className="w-3 h-3 rounded-full bg-white/20" />
              <span className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <span className="mx-auto text-white/80 text-xs font-medium tracking-wide">
              New Draft
            </span>
            <Mail className="w-3.5 h-3.5 text-white/50" />
          </div>

          {/* Header fields */}
          <div className="px-5 py-3 space-y-2 border-b border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium w-12 flex-shrink-0">
                To
              </span>
              <span className="text-xs text-foreground/80 truncate">
                {sample.to}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground font-medium w-12 flex-shrink-0 pt-0.5">
                Subject
              </span>
              <span className="text-xs font-semibold text-foreground flex-1">
                {displayedSubject}
                {phase === "subject" && showCursor && (
                  <span className="inline-block w-0.5 h-3 bg-foreground ml-0.5 animate-pulse" />
                )}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 min-h-[200px]">
            <pre
              className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap font-sans"
              style={{ fontFamily: "inherit" }}
            >
              {displayedBody}
              {phase === "body" && showCursor && (
                <span className="inline-block w-0.5 h-3 bg-foreground ml-0.5 animate-pulse" />
              )}
            </pre>
          </div>

          {/* Footer bar */}
          <div
            className="px-5 py-3 flex items-center justify-between border-t border-border/50"
            style={{ background: "oklch(0.96 0.008 250)" }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ACCENT }}
              />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Generated by EmailCraft
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {phase === "subject" || phase === "body"
                ? "Writing…"
                : "Ready to send"}
            </span>
          </div>
        </div>

        {/* Floating badge */}
        <div
          className="absolute -top-4 -right-4 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-elevated"
          style={{ background: ACCENT, color: "oklch(0.13 0.025 255)" }}
        >
          {sampleIndex + 1} / {EMAIL_SAMPLES.length} samples
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Scroll progress dots ──────────────────────────────────────────────────────
function ProgressDots({
  active,
  onDotClick,
  labels,
}: {
  active: number;
  onDotClick: (i: number) => void;
  labels: string[];
}) {
  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-center"
      aria-label="Page sections"
    >
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          aria-label={`Go to ${label}`}
          onClick={() => onDotClick(i)}
          className={cn(
            "rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-ring",
            i === active
              ? "w-2.5 h-2.5 bg-primary"
              : "w-2 h-2 bg-primary/25 hover:bg-primary/50",
          )}
          data-ocid={`landing.nav_dot.${(i + 1) as 1 | 2 | 3 | 4}`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage({
  login,
  isLoggingIn,
  onTryFree,
}: {
  login: () => void;
  isLoggingIn: boolean;
  onTryFree: () => void;
}) {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const SECTION_LABELS = ["Hero", "Features", "Social Proof", "Get Started"];

  // IntersectionObserver to track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(i);
        },
        { root: scrollContainerRef.current, threshold: 0.5 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  const scrollToSection = useCallback((i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* ── Navbar (outside scroll container) ── */}
      <header className="flex-shrink-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              EmailCraft
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onTryFree}
              size="sm"
              className="gap-1.5 font-semibold"
              data-ocid="landing.try_free.button"
            >
              Try it free
            </Button>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              variant="ghost"
              size="sm"
              className="gap-1.5 font-medium text-muted-foreground hover:text-foreground"
              data-ocid="landing.sign_in.button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </div>
        </div>
      </header>

      {/* ── Scroll container ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* ── Section 1: Hero ── */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          className="relative flex items-center overflow-hidden"
          style={{
            height: "100%",
            scrollSnapAlign: "start",
            minHeight: "100%",
          }}
          data-ocid="landing.hero.section"
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${PRIMARY}22 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
              opacity: 0.6,
            }}
          />
          {/* Radial fade top-right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 70% at 75% -5%, ${PRIMARY}09, transparent)`,
            }}
          />

          <div className="relative max-w-6xl mx-auto px-5 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left */}
              <div className="flex-1 max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5"
                  style={{
                    borderColor: `${ACCENT}55`,
                    background: `${ACCENT}18`,
                    color: "oklch(0.35 0.05 70)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: ACCENT }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Professional email, in minutes
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className="font-display font-extrabold tracking-tight text-foreground leading-[1.04] mb-5"
                  style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
                >
                  Stop staring at a
                  <br />
                  <span className="relative whitespace-nowrap">
                    <span className="relative z-10">blank email.</span>
                    <svg
                      className="absolute left-0 -bottom-1 w-full"
                      height="8"
                      viewBox="0 0 300 8"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6 Q75 2 150 5 Q225 8 298 3"
                        stroke={ACCENT}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                  className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6"
                >
                  Pick a template, set your tone, and get a polished email in
                  under 60 seconds.
                </motion.p>

                {/* Category marquee */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-7 -mx-5 sm:-mx-0"
                >
                  <CategoryStrip />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <Button
                    size="lg"
                    onClick={onTryFree}
                    className="h-12 px-7 text-base font-semibold gap-2 shadow-elevated"
                    data-ocid="landing.hero_try_free.button"
                  >
                    Try it free →
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="h-12 px-5 text-sm font-medium text-muted-foreground hover:text-foreground gap-1.5"
                    data-ocid="landing.hero_sign_in.button"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Sign in
                  </Button>
                </motion.div>
              </div>

              {/* Right: typing animation */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.2 }}
                className="flex-shrink-0 w-full lg:w-auto flex justify-center relative"
                style={{ maxWidth: 480 }}
              >
                <TypingEmailCard />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Features ── */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          className="relative flex items-center overflow-hidden"
          style={{
            height: "100%",
            scrollSnapAlign: "start",
            minHeight: "100%",
            background: "oklch(0.95 0.006 250)",
          }}
          data-ocid="landing.features.section"
        >
          {/* Diagonal stripe texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, oklch(0.26 0.075 258 / 0.04) 0px, oklch(0.26 0.075 258 / 0.04) 1px, transparent 1px, transparent 20px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-center mb-12"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "oklch(0.45 0.08 258)" }}
              >
                Why EmailCraft
              </p>
              <h2
                className="font-display font-extrabold tracking-tight leading-tight"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "oklch(0.18 0.05 258)",
                }}
              >
                Write better emails.
                <br />
                <span style={{ color: PRIMARY }}>
                  In a fraction of the time.
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  Icon: Zap,
                  title: "Write in 60 seconds",
                  desc: "From blank page to polished email before your coffee gets cold.",
                  delay: 0.05,
                },
                {
                  Icon: Target,
                  title: "Sound exactly right",
                  desc: "11 tone settings dial in your voice — formal, friendly, assertive, or anything between.",
                  delay: 0.12,
                },
                {
                  Icon: Layers,
                  title: "Never start from scratch",
                  desc: "216 templates across 15 categories. There's a starting point for every email you'll ever need.",
                  delay: 0.19,
                },
              ].map(({ Icon, title, desc, delay }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay }}
                  className="bg-card border border-border/70 rounded-2xl p-8 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 flex flex-col gap-5"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `${PRIMARY}14` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <h3
                      className="font-display font-bold text-lg mb-2"
                      style={{ color: "oklch(0.18 0.05 258)" }}
                    >
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Social Proof ── */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="relative flex items-center overflow-hidden"
          style={{
            height: "100%",
            scrollSnapAlign: "start",
            minHeight: "100%",
            background:
              "linear-gradient(160deg, oklch(0.99 0 0) 0%, oklch(0.97 0.008 60) 100%)",
          }}
          data-ocid="landing.social_proof.section"
        >
          <div className="relative max-w-4xl mx-auto px-5 w-full">
            {/* Featured testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div
                className="text-7xl font-serif leading-none mb-4 select-none"
                style={{ color: ACCENT, opacity: 0.5 }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <blockquote
                className="font-display font-semibold leading-snug mx-auto mb-6"
                style={{
                  fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)",
                  color: "oklch(0.2 0.04 258)",
                  maxWidth: 640,
                }}
              >
                I send 30+ cold outreach emails a week. EmailCraft cut my
                writing time in half and my reply rate actually went up. The
                tone settings are the killer feature.
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: PRIMARY }}
                >
                  <span className="text-white text-xs font-bold">MT</span>
                </div>
                <div className="text-left">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.2 0.04 258)" }}
                  >
                    Marcus T.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sales Manager, B2B SaaS
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-0 border border-border rounded-2xl overflow-hidden shadow-card bg-card divide-y sm:divide-y-0 sm:divide-x divide-border"
            >
              {[
                { stat: "216", label: "templates ready to use" },
                { stat: "15", label: "categories covered" },
                { stat: "< 60s", label: "average time to inbox-ready" },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center py-8 px-6 gap-1"
                >
                  <span
                    className="font-display font-extrabold leading-none"
                    style={{
                      fontSize: "clamp(2rem, 4vw, 2.75rem)",
                      color: PRIMARY,
                    }}
                  >
                    {stat}
                  </span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Section 4: Final CTA ── */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="relative flex flex-col items-center justify-between overflow-hidden"
          style={{
            height: "100%",
            scrollSnapAlign: "start",
            minHeight: "100%",
            background: PRIMARY,
          }}
          data-ocid="landing.cta.section"
        >
          {/* Diagonal mesh */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Amber glow left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 55% 80% at -5% 50%, ${ACCENT}22, transparent)`,
            }}
          />
          {/* Amber glow right */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 55% 80% at 105% 50%, ${ACCENT}16, transparent)`,
            }}
          />

          {/* Content */}
          <div className="relative flex-1 flex items-center justify-center w-full">
            <div className="max-w-2xl mx-auto px-5 text-center">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Start for free
                </p>

                <h2
                  className="font-display font-extrabold tracking-tight leading-[1.1] mb-6"
                  style={{
                    fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                    color: "rgba(255,255,255,0.95)",
                  }}
                >
                  Your next great email is <br />
                  <span style={{ color: ACCENT }}>one click away.</span>
                </h2>

                <p
                  className="text-base lg:text-lg leading-relaxed mb-10 max-w-sm mx-auto"
                  style={{ color: "rgba(255,255,255,0.60)" }}
                >
                  Join professionals who write faster, sound polished, and never
                  start from scratch.
                </p>

                <Button
                  size="lg"
                  onClick={onTryFree}
                  className="h-13 px-8 text-base font-semibold gap-2 shadow-elevated mb-3"
                  style={{
                    background: ACCENT,
                    color: "oklch(0.13 0.025 255)",
                  }}
                  data-ocid="landing.bottom_cta.button"
                >
                  Try it free — no account needed →
                </Button>

                <div className="block">
                  <Button
                    variant="ghost"
                    onClick={login}
                    disabled={isLoggingIn}
                    className="text-sm gap-1.5"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                    data-ocid="landing.bottom_signin.button"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Already have an account? Sign in
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer
            className="relative w-full py-4 px-5 flex items-center justify-center border-t"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              © {new Date().getFullYear()} EmailCraft · Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </section>
      </div>

      {/* ── Progress dots ── */}
      <ProgressDots
        active={activeSection}
        onDotClick={scrollToSection}
        labels={SECTION_LABELS}
      />
    </div>
  );
}
