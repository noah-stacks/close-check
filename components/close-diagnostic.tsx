"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  Check,
  Timer,
  Cpu,
  Shield,
  Eye,
  Lock,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";
import {
  questions,
  categories,
  benchmarks,
  calculateResults,
  getScoreLabel,
  getScoreColor,
  getBenchmarkVerdict,
  getCloseArchetype,
  getCategoryBenchmarkPosition,
  type DiagnosticResults,
  type CategoryKey,
} from "@/lib/diagnostic";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "landing" | "questions" | "calculating" | "results";

// ─── Animation variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();
    let frame: number;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return count;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const categoryIcons: Record<CategoryKey, typeof Timer> = {
  speed: Timer,
  automation: Cpu,
  controls: Shield,
  visibility: Eye,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/* ──────── Score Gauge ──────── */

function ScoreGauge({ score }: { score: number }) {
  const displayScore = useCountUp(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (displayScore / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="192" height="192" viewBox="0 0 192 192">
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="10"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 96 96)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-zinc-950">
          {displayScore}
        </span>
        <span className="mt-1 text-sm text-zinc-400">out of 100</span>
      </div>
    </div>
  );
}

/* ──────── Category Score Card ──────── */

function CategoryScoreCard({
  category,
  score,
  index,
}: {
  category: CategoryKey;
  score: number;
  index: number;
}) {
  const Icon = categoryIcons[category];
  const info = categories[category];
  const bm = benchmarks.categories[category];
  const position = getCategoryBenchmarkPosition(category, score);
  const positionLabels: Record<string, { label: string; color: string }> = {
    top: { label: "Top 25%", color: "#059669" },
    "above-median": { label: "Above avg", color: "#0891b2" },
    "below-median": { label: "Below avg", color: "#d97706" },
    bottom: { label: "Bottom 25%", color: "#dc2626" },
  };
  const posInfo = positionLabels[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 + index * 0.1, duration: 0.4 }}
      className="rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">{info.label}</span>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: posInfo.color }}
        >
          {posInfo.label}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-2xl font-bold text-zinc-950">{score}</span>
        <span className="mb-0.5 text-sm text-zinc-400">/100</span>
      </div>
      {/* Score bar with median marker */}
      <div className="relative mt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getScoreColor(score) }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 2.0 + index * 0.1 }}
          />
        </div>
        {/* Median marker */}
        <motion.div
          className="absolute top-0 h-1.5 w-0.5 bg-zinc-400 rounded-full"
          style={{ left: `${bm.median}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 + index * 0.1 }}
          title={`Median: ${bm.median}`}
        />
      </div>
      <div className="mt-1 flex justify-end text-[10px] text-zinc-400">
        <span>Median: {bm.median}</span>
      </div>
    </motion.div>
  );
}

/* ──────── Close Archetype Badge ──────── */

function ArchetypeBadge({
  results,
}: {
  results: DiagnosticResults;
}) {
  const archetype = getCloseArchetype(
    results.categoryScores,
    results.overallScore
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="mt-8"
    >
      <div className="flex flex-col items-center">
        {/* Label */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Your Close Archetype
        </p>

        {/* Icon + Text row */}
        <div className="mt-4 flex items-center gap-4">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.4, type: "spring", stiffness: 250, damping: 20 }}
            className="shrink-0"
          >
            <Image
              src="/firefighter-icon.png"
              alt="Close archetype"
              width={100}
              height={100}
              className="opacity-80"
            />
          </motion.div>

          {/* Title + Description */}
          <div className="flex flex-col gap-1">
            <h3
              className="text-xl font-bold tracking-tight text-left"
              style={{ color: archetype.color }}
            >
              {archetype.title}
            </h3>
            <p className="max-w-sm text-left text-sm leading-relaxed text-zinc-500">
              {archetype.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────── Email Gate ──────── */

function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const valid = email.includes("@") && email.includes(".");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6 }}
      className="rounded-2xl border border-zinc-200 bg-white p-8"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
        <Lock className="h-4 w-4" />
        Unlock Your Full Report
      </div>

      <h3 className="mt-3 text-xl font-semibold text-zinc-950">
        See what&apos;s holding your close back&nbsp;&mdash; and how to fix it
      </h3>

      <ul className="mt-4 space-y-2 text-sm text-zinc-500">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500" />
          Detailed category breakdown
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500" />
          Prioritized recommendations
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-500" />
          Peer benchmark comparison
        </li>
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSubmit(email);
        }}
        className="mt-6 space-y-3"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role (optional)"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <button
          type="submit"
          disabled={!valid}
          className="w-full rounded-xl bg-zinc-950 py-3.5 text-base font-semibold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Get Your Full Report
        </button>
        <p className="text-center text-xs text-zinc-400">
          We&apos;ll never share your email. Unsubscribe anytime.
        </p>
      </form>
    </motion.div>
  );
}

// ─── Phase components ─────────────────────────────────────────────────────────

/* ──────── Landing ──────── */

function LandingPhase({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-500"
        >
          <BarChart3 className="h-4 w-4" />
          Tested 500+ times
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl sm:leading-[1.15]"
        >
          How efficient is your
          <br />
          month-end close?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-zinc-500"
        >
          Answer 12 quick questions and get your Close Efficiency Score —
          benchmarked against dozens of leading finance teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mt-8"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Benchmarked companies include
          </p>
          <div className="flex items-center justify-center gap-8">
            {[
              { src: "/logos/bloom.svg", alt: "Bloom", h: 22 },
              { src: "/logos/epidemic.webp", alt: "Epidemic Sound", h: 20 },
              { src: "/logos/fastned.png", alt: "Fastned", h: 22 },
              { src: "/logos/logo-datavant.svg", alt: "Datavant", h: 20 },
            ].map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={logo.h}
                className="h-5 w-auto grayscale opacity-70"
                unoptimized
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <button
            onClick={onStart}
            className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-zinc-950 px-8 text-base font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-950/10"
          >
            Start Diagnostic
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 text-sm text-zinc-400"
        >
          Free &middot; 3 minutes &middot; No signup required
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ──────── Questions ──────── */

function QuestionPhase({
  currentQuestion,
  answers,
  direction,
  isTransitioning,
  onAnswer,
  onBack,
}: {
  currentQuestion: number;
  answers: Record<string, number>;
  direction: number;
  isTransitioning: boolean;
  onAnswer: (questionId: string, value: number) => void;
  onBack: () => void;
}) {
  const question = questions[currentQuestion];
  const selectedValue = answers[question.id];
  const progress = (currentQuestion / questions.length) * 100;

  // Track content height for smooth container animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const h = el.scrollHeight;
      // Skip near-zero heights during AnimatePresence exit (content temporarily removed)
      if (h > 10) setContentHeight(h);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className="flex min-h-dvh flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-zinc-100">
        <motion.div
          className="h-full bg-zinc-900"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl">
          {/* Header row */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600 disabled:pointer-events-none disabled:opacity-0"
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-sm font-medium text-zinc-400">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>

          {/* Question card — height-animated wrapper keeps centering smooth */}
          <motion.div
            animate={{ height: contentHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={question.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.25 }}
                >
                  <h2 className="text-2xl font-semibold leading-snug tracking-tight text-zinc-950 sm:text-3xl">
                    {question.question}
                  </h2>
                  {question.subtitle && (
                    <p className="mt-3 text-base text-zinc-400">
                      {question.subtitle}
                    </p>
                  )}

                  {/* Options */}
                  <div className="mt-8 space-y-3">
                    {question.options.map((option, i) => {
                      const isSelected = selectedValue === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.04 }}
                          whileTap={{ scale: 0.985 }}
                          disabled={isTransitioning}
                          onClick={() => onAnswer(question.id, option.value)}
                          className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 ease-in-out ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                          } ${isTransitioning ? "pointer-events-none" : ""}`}
                        >
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out ${
                              isSelected
                                ? "border-zinc-900 bg-zinc-900"
                                : "border-zinc-300 group-hover:border-zinc-400"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-white" />
                            )}
                          </div>
                          <span
                            className={`text-base ${
                              isSelected
                                ? "font-medium text-zinc-900"
                                : "text-zinc-600"
                            }`}
                          >
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────── Calculating ──────── */

function CalculatingPhase() {
  const steps = [
    "Analyzing your responses",
    "Comparing to peer benchmarks",
    "Generating recommendations",
  ];
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCompleted(i + 1), (i + 1) * 1500)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.9 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="flex h-6 w-6 items-center justify-center rounded-full"
              animate={{
                backgroundColor: completed > i ? "#10b981" : "#e4e4e7",
              }}
              transition={{ duration: 0.3 }}
            >
              {completed > i ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  className="h-2 w-2 rounded-full bg-zinc-400"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
            <motion.span
              className="text-base"
              animate={{ color: completed > i ? "#18181b" : "#a1a1aa" }}
              transition={{ duration: 0.3 }}
            >
              {step}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ──────── Results ──────── */

/* ──────── Blurred Locked Preview ──────── */

function LockedPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4 }}
      className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-200"
    >
      {/* Blurred content behind */}
      <div className="pointer-events-none select-none blur-[6px] p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Target className="h-4 w-4" />
          Prioritized Action Plan
        </div>
        <div className="space-y-2.5">
          {[
            { title: "Compress your close timeline", impact: "high" },
            { title: "Automate account reconciliations", impact: "high" },
            { title: "Strengthen journal entry controls", impact: "medium" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-800">
                  {item.title}
                </span>
                <span
                  className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    item.impact === "high"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {item.impact}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
                eiusmod tempor incididunt.
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-zinc-50 p-3">
          <div className="text-sm font-medium text-zinc-700">
            Benchmark Comparison Chart
          </div>
          <div className="mt-2 flex gap-2">
            <div className="h-16 flex-1 rounded bg-zinc-200" />
            <div className="h-16 flex-1 rounded bg-zinc-200" />
            <div className="h-16 flex-1 rounded bg-zinc-200" />
            <div className="h-16 flex-1 rounded bg-zinc-200" />
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
            <Lock className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-700">
            Full Report Locked
          </p>
          <p className="max-w-[220px] text-center text-xs text-zinc-400">
            Enter your email below to unlock your action plan &amp; detailed benchmarks
          </p>
        </div>
      </div>
    </motion.div>
  );
}


/* ──────── Results ──────── */

function ResultsPhase({
  results,
  emailSubmitted,
  onSubmitEmail,
  onRestart,
}: {
  results: DiagnosticResults;
  emailSubmitted: boolean;
  onSubmitEmail: (email: string) => void;
  onRestart: () => void;
}) {
  const verdict = getBenchmarkVerdict(results.benchmarkPosition);
  const recsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (emailSubmitted && recsRef.current) {
      setTimeout(() => {
        recsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [emailSubmitted]);

  return (
    <motion.div
      className="min-h-dvh px-6 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-xl">
        {/* ── Score hero ── */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium uppercase tracking-widest text-zinc-400"
          >
            Your Close Efficiency Score
          </motion.p>

          <div className="mt-8">
            <ScoreGauge score={results.overallScore} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <span
              className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                color: getScoreColor(results.overallScore),
                backgroundColor: `${getScoreColor(results.overallScore)}15`,
              }}
            >
              {getScoreLabel(results.overallScore)}
            </span>
          </motion.div>

          {/* ── Close Archetype ── */}
          <ArchetypeBadge results={results} />

          {/* ── Benchmark verdict ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mt-6"
          >
            <div className="rounded-xl bg-zinc-50 p-5 text-left">
              <p className="text-sm font-semibold text-zinc-900">
                {verdict.headline}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {verdict.description}
              </p>

              {/* Quartile indicator */}
              <div className="mt-4 flex gap-1">
                {(
                  ["bottom", "below-median", "above-median", "top"] as const
                ).map((pos) => (
                  <div
                    key={pos}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      pos === results.benchmarkPosition
                        ? "bg-zinc-900"
                        : "bg-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-zinc-400">
                <span>Bottom 25%</span>
                <span>Median</span>
                <span>Top 25%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Category breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-10"
        >
          <h3 className="text-lg font-semibold text-zinc-950">
            Category Breakdown
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(Object.keys(categories) as CategoryKey[]).map((key, i) => (
              <CategoryScoreCard
                key={key}
                category={key}
                score={results.categoryScores[key]}
                index={i}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Blurred locked preview (only when not yet unlocked) ── */}
        {!emailSubmitted && <LockedPreview />}

        {/* ── Email gate / Recommendations ── */}
        <div className="mt-10">
          {!emailSubmitted ? (
            <>
              <EmailGate onSubmit={onSubmitEmail} />
              <div className="mt-6 pb-8 text-center">
                <button
                  onClick={onRestart}
                  className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                >
                  Fill out again
                </button>
              </div>
            </>
          ) : (
            <div ref={recsRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-200 bg-white p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50"
                >
                  <Check className="h-7 w-7 text-emerald-500" />
                </motion.div>

                <h3 className="mt-5 text-xl font-semibold text-zinc-950">
                  The report is on its way!
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  We&apos;ve received your request. The report will be sent to your email shortly. In the meantime, you can visit our website to learn more about Stacks.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="https://www.getstacks.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Visit Stacks
                  </a>
                  <a
                    href="https://www.getstacks.com/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-50"
                  >
                    <Calendar className="h-4 w-4" />
                    Book a Demo
                  </a>
                </div>

                <div className="mt-8">
                  <button
                    onClick={onRestart}
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                  >
                    Start over
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CloseDiagnostic() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showBottomLogo, setShowBottomLogo] = useState(true);

  // ── Refs for browser history navigation (avoids stale closures) ──
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const maxReachedQuestion = useRef(0);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calculatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Always start fresh on page load / refresh ──
  useEffect(() => {
    window.history.replaceState({ phase: "landing" }, "");
  }, []);

  // ── Handle browser back/forward buttons ──
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;

      // Cancel any pending transition or calculating timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      if (calculatingTimeoutRef.current) {
        clearTimeout(calculatingTimeoutRef.current);
        calculatingTimeoutRef.current = null;
      }
      setIsTransitioning(false);

      // No state or landing state → go to landing
      if (!state || state.phase === "landing") {
        setPhase("landing");
        return;
      }

      if (state.phase === "questions") {
        // Restore answers and progress from history state
        if (state.answers) {
          setAnswers(state.answers);
        }
        if (typeof state.maxReached === "number") {
          maxReachedQuestion.current = state.maxReached;
        }
        const targetQ = state.question as number;
        // Only allow navigating to questions that have been unlocked
        if (targetQ <= maxReachedQuestion.current) {
          const dir = targetQ > currentQuestionRef.current ? 1 : -1;
          setDirection(dir);
          setCurrentQuestion(targetQ);
          setPhase("questions");
        }
        return;
      }

      if (state.phase === "results") {
        if (state.answers) {
          setAnswers(state.answers);
          const res = calculateResults(state.answers);
          setResults(res);
        }
        if (typeof state.maxReached === "number") {
          maxReachedQuestion.current = state.maxReached;
        }
        setPhase("results");
        return;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top on phase change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  // Show/hide bottom logo on results screen based on whether content is behind it
  useEffect(() => {
    if (phase !== "results") {
      setShowBottomLogo(true);
      return;
    }

    const checkScroll = () => {
      const { scrollHeight, clientHeight } = document.documentElement;
      const scrollTop = window.scrollY;
      const hasScroll = scrollHeight > clientHeight + 10;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
      setShowBottomLogo(!hasScroll || isAtBottom);
    };

    // Delay initial check so content can render / animate in
    const timer = setTimeout(checkScroll, 300);
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [phase, emailSubmitted]);

  const handleRestart = useCallback(() => {
    // Cancel any pending timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (calculatingTimeoutRef.current) {
      clearTimeout(calculatingTimeoutRef.current);
      calculatingTimeoutRef.current = null;
    }
    setPhase("landing");
    setCurrentQuestion(0);
    setAnswers({});
    setDirection(1);
    setIsTransitioning(false);
    setResults(null);
    setEmailSubmitted(false);
    maxReachedQuestion.current = 0;
    window.history.pushState({ phase: "landing" }, "");
  }, []);

  const handleStart = useCallback(() => {
    setPhase("questions");
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
    setEmailSubmitted(false);
    maxReachedQuestion.current = 0;
    window.history.pushState(
      { phase: "questions", question: 0, answers: {}, maxReached: 0 },
      ""
    );
  }, []);

  const handleAnswer = useCallback(
    (questionId: string, value: number) => {
      if (isTransitioning) return;

      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);
      setIsTransitioning(true);

      transitionTimeoutRef.current = setTimeout(() => {
        transitionTimeoutRef.current = null;
        if (currentQuestion < questions.length - 1) {
          const nextQ = currentQuestion + 1;
          setDirection(1);
          setCurrentQuestion(nextQ);
          maxReachedQuestion.current = Math.max(
            maxReachedQuestion.current,
            nextQ
          );
          window.history.pushState(
            {
              phase: "questions",
              question: nextQ,
              answers: newAnswers,
              maxReached: maxReachedQuestion.current,
            },
            ""
          );
        } else {
          setPhase("calculating");

          // Allow calculating animation to play, then show results
          calculatingTimeoutRef.current = setTimeout(() => {
            calculatingTimeoutRef.current = null;
            if (phaseRef.current !== "calculating") return;
            const res = calculateResults(newAnswers);
            setResults(res);
            setPhase("results");
            window.history.pushState(
              {
                phase: "results",
                answers: newAnswers,
                maxReached: maxReachedQuestion.current,
              },
              ""
            );
          }, 6000);
        }
        setIsTransitioning(false);
      }, 400);
    },
    [isTransitioning, answers, currentQuestion]
  );

  const handleBack = useCallback(() => {
    if (isTransitioning) return;
    window.history.back();
  }, [isTransitioning]);

  const handleSubmitEmail = (email: string) => {
    // In production, POST to your API / CRM here
    console.log("Lead captured:", { email });
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-dvh bg-white">
      <AnimatePresence mode="wait">
        {phase === "landing" && (
          <LandingPhase key="landing" onStart={handleStart} />
        )}

        {phase === "questions" && (
          <QuestionPhase
            key="questions"
            currentQuestion={currentQuestion}
            answers={answers}
            direction={direction}
            isTransitioning={isTransitioning}
            onAnswer={handleAnswer}
            onBack={handleBack}
          />
        )}

        {phase === "calculating" && <CalculatingPhase key="calculating" />}

        {phase === "results" && results && (
          <ResultsPhase
            key="results"
            results={results}
            emailSubmitted={emailSubmitted}
            onSubmitEmail={handleSubmitEmail}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>

      {/* Stacks logo — fixed at bottom center, hidden when content is behind it */}
      <div
        className={`fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50 transition-opacity duration-300 ${
          showBottomLogo ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src="/StacksLogo_Black.png"
          alt="Stacks"
          width={100}
          height={28}
          className="opacity-40"
        />
      </div>
    </div>
  );
}
