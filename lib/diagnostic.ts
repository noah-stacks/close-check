// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryKey = "speed" | "automation" | "controls" | "visibility";

export interface DiagnosticOption {
  label: string;
  value: number; // 0-100
}

export interface DiagnosticQuestion {
  id: string;
  category: CategoryKey;
  question: string;
  subtitle?: string;
  options: DiagnosticOption[];
}

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  description: string;
}

export interface Recommendation {
  category: CategoryKey;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface DiagnosticResults {
  overallScore: number;
  categoryScores: Record<CategoryKey, number>;
  benchmarkPosition: "top" | "above-median" | "below-median" | "bottom";
  recommendations: Recommendation[];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories: Record<CategoryKey, CategoryInfo> = {
  speed: {
    key: "speed",
    label: "Speed & Efficiency",
    description: "How quickly and efficiently you execute the close",
  },
  automation: {
    key: "automation",
    label: "Automation & Scalability",
    description: "Level of automation and ability to handle growth",
  },
  controls: {
    key: "controls",
    label: "Controls & Accuracy",
    description: "Strength of internal controls and review processes",
  },
  visibility: {
    key: "visibility",
    label: "Visibility & Process",
    description: "Tracking, documentation, and process maturity",
  },
};

// ─── Questions (12 total) ─────────────────────────────────────────────────────

export const questions: DiagnosticQuestion[] = [
  // ── 1. ERP system ──
  {
    id: "erp-system",
    category: "automation",
    question: "What is your primary ERP or accounting system?",
    options: [
      { label: "Enterprise ERP (NetSuite, SAP, Oracle, Dynamics 365)", value: 85 },
      { label: "Mid-market cloud ERP (Sage Intacct, Acumatica)", value: 70 },
      { label: "Small-business tools (QuickBooks, Xero, FreshBooks)", value: 45 },
      { label: "Spreadsheets or no dedicated system", value: 15 },
    ],
  },
  // ── 2. Close team size ──
  {
    id: "close-team-size",
    category: "speed",
    question:
      "How many people are directly involved in executing the month-end close?",
    subtitle: "Include anyone who contributes to close tasks",
    options: [
      { label: "1–2 people", value: 50 },
      { label: "3–5 people", value: 75 },
      { label: "6–10 people", value: 55 },
      { label: "11–20 people", value: 35 },
      { label: "20+ people", value: 20 },
    ],
  },
  // ── 3. Days to close ──
  {
    id: "days-to-close",
    category: "speed",
    question:
      "How many business days does your month-end close typically take?",
    subtitle: "From period end to books closed",
    options: [
      { label: "1–3 days", value: 100 },
      { label: "4–5 days", value: 80 },
      { label: "6–8 days", value: 55 },
      { label: "9–12 days", value: 30 },
      { label: "13+ days", value: 10 },
    ],
  },
  // ── 4. Balance sheet accounts ──
  {
    id: "balance-sheet-accounts",
    category: "controls",
    question:
      "Roughly how many balance sheet accounts does your organization maintain?",
    options: [
      { label: "Under 50", value: 80 },
      { label: "50–100", value: 65 },
      { label: "101–250", value: 45 },
      { label: "250–500", value: 30 },
      { label: "500+", value: 15 },
    ],
  },
  // ── 5. Reconciliation coverage ──
  {
    id: "recon-coverage",
    category: "controls",
    question:
      "What percentage of your balance sheet accounts are reconciled every month?",
    options: [
      { label: "100% — every account, every month", value: 100 },
      { label: "75–99%", value: 75 },
      { label: "50–74%", value: 50 },
      { label: "25–49%", value: 25 },
      { label: "Under 25%", value: 5 },
    ],
  },
  // ── 6. Bank feeds ──
  {
    id: "bank-feeds",
    category: "automation",
    question: "How are your bank accounts and transaction feeds managed?",
    subtitle: "Consider all bank accounts across the organization",
    options: [
      { label: "Fully automated — bank feeds integrated with ERP, auto-reconciled", value: 100 },
      { label: "Automated feeds with manual reconciliation", value: 70 },
      { label: "Manual downloads imported into accounting system", value: 40 },
      { label: "Fully manual — statements reviewed and entered by hand", value: 10 },
    ],
  },
  // ── 7. Journal entries ──
  {
    id: "journal-entries",
    category: "automation",
    question: "How are journal entries handled during the close?",
    subtitle: "Include recurring, adjusting, and one-time entries",
    options: [
      { label: "Mostly automated — recurring schedules, auto-posting, exception-based review", value: 100 },
      { label: "Template-driven — standardized templates, manual posting and approval", value: 70 },
      { label: "Mix of templates and entries created from scratch", value: 40 },
      { label: "Mostly manual — entries built from scratch each month", value: 15 },
    ],
  },
  // ── 8. Flux / variance analysis ──
  {
    id: "flux-analysis",
    category: "controls",
    question: "What is your approach to flux / variance analysis?",
    subtitle: "Period-over-period and budget-to-actual comparisons",
    options: [
      { label: "Automated with pre-set thresholds and exception alerts", value: 100 },
      { label: "Systematic process with documented thresholds", value: 75 },
      { label: "Excel-based analysis with some defined thresholds", value: 50 },
      { label: "Ad-hoc — investigate when something looks off", value: 25 },
      { label: "We don't do formal flux analysis", value: 5 },
    ],
  },
  // ── 9. External audit ──
  {
    id: "external-audit",
    category: "controls",
    question: "Are you subject to an external audit?",
    options: [
      { label: "Yes — and we're fully audit-ready year-round", value: 100 },
      { label: "Yes — but significant prep work is needed before audit", value: 45 },
      { label: "Yes — and audits regularly surface material findings", value: 15 },
      { label: "No external audit requirement", value: 60 },
    ],
  },
  // ── 10. Manual effort ──
  {
    id: "manual-effort",
    category: "speed",
    question:
      "What portion of your close involves manual data manipulation?",
    subtitle: "Spreadsheets, copy-paste, manual data entry, etc.",
    options: [
      { label: "Under 10%", value: 100 },
      { label: "10–25%", value: 75 },
      { label: "26–50%", value: 50 },
      { label: "51–75%", value: 25 },
      { label: "Over 75%", value: 5 },
    ],
  },
  // ── 11. Close tracking ──
  {
    id: "close-tracking",
    category: "visibility",
    question: "How do you track close progress and task completion?",
    options: [
      { label: "Real-time dashboard with automated status tracking", value: 100 },
      { label: "Close management tool with manual updates", value: 75 },
      { label: "Shared checklist or spreadsheet", value: 50 },
      { label: "Email or verbal updates", value: 25 },
      { label: "We don't formally track it", value: 5 },
    ],
  },
  // ── 12. Close documentation ──
  {
    id: "close-documentation",
    category: "visibility",
    question: "How well-documented is your close process?",
    subtitle: "Consider SOPs, checklists, and runbooks",
    options: [
      { label: "Fully documented — SOPs for every step, regularly updated", value: 100 },
      { label: "Mostly documented — key processes have written instructions", value: 70 },
      { label: "Partially documented — some procedures, lots of tribal knowledge", value: 40 },
      { label: "Barely documented — process lives in people's heads", value: 15 },
    ],
  },
];

// ─── Benchmarks (peer data from dozens of leading finance orgs) ───────────────────────────

export const benchmarks = {
  overall: { topQuartile: 82, median: 56, bottomQuartile: 38 },
  categories: {
    speed: { topQuartile: 78, median: 52, bottomQuartile: 35 },
    automation: { topQuartile: 80, median: 50, bottomQuartile: 30 },
    controls: { topQuartile: 85, median: 60, bottomQuartile: 40 },
    visibility: { topQuartile: 75, median: 50, bottomQuartile: 30 },
  },
};

// ─── Question weights ─────────────────────────────────────────────────────────

const questionWeights: Record<string, number> = {
  "erp-system": 0.8,
  "close-team-size": 0.7,
  "days-to-close": 1.5,
  "balance-sheet-accounts": 0.7,
  "recon-coverage": 1.3,
  "bank-feeds": 1.0,
  "journal-entries": 1.0,
  "flux-analysis": 1.0,
  "external-audit": 0.8,
  "manual-effort": 1.2,
  "close-tracking": 1.0,
  "close-documentation": 1.0,
};

// ─── Scoring engine ───────────────────────────────────────────────────────────

export function calculateResults(
  answers: Record<string, number>
): DiagnosticResults {
  const categoryTotals: Record<CategoryKey, { sum: number; weight: number }> = {
    speed: { sum: 0, weight: 0 },
    automation: { sum: 0, weight: 0 },
    controls: { sum: 0, weight: 0 },
    visibility: { sum: 0, weight: 0 },
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;

    const w = questionWeights[q.id] ?? 1;
    categoryTotals[q.category].sum += answer * w;
    categoryTotals[q.category].weight += w;
    totalWeightedScore += answer * w;
    totalWeight += w;
  }

  const categoryScores = Object.fromEntries(
    (Object.keys(categoryTotals) as CategoryKey[]).map((key) => {
      const { sum, weight } = categoryTotals[key];
      return [key, weight > 0 ? Math.round(sum / weight) : 0];
    })
  ) as Record<CategoryKey, number>;

  const overallScore =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  let benchmarkPosition: DiagnosticResults["benchmarkPosition"];
  if (overallScore >= benchmarks.overall.topQuartile) {
    benchmarkPosition = "top";
  } else if (overallScore >= benchmarks.overall.median) {
    benchmarkPosition = "above-median";
  } else if (overallScore >= benchmarks.overall.bottomQuartile) {
    benchmarkPosition = "below-median";
  } else {
    benchmarkPosition = "bottom";
  }

  return {
    overallScore,
    categoryScores,
    benchmarkPosition,
    recommendations: generateRecommendations(answers),
  };
}

// ─── Recommendation engine ────────────────────────────────────────────────────

function generateRecommendations(
  answers: Record<string, number>
): Recommendation[] {
  const recs: Recommendation[] = [];

  // ── Days to close ──
  if (answers["days-to-close"] !== undefined && answers["days-to-close"] <= 55) {
    recs.push({
      category: "speed",
      title: "Compress your close timeline",
      description:
        "Top-performing teams close in 1–5 business days. Parallelizing tasks, implementing a close calendar with clear owners, and automating bottleneck steps can shave days off your cycle.",
      impact: "high",
    });
  }

  // ── Manual effort ──
  if (answers["manual-effort"] !== undefined && answers["manual-effort"] <= 50) {
    recs.push({
      category: "speed",
      title: "Reduce manual data manipulation",
      description:
        "High manual effort introduces errors and slows every close. Target your biggest time sinks first — typically reconciliations, data consolidation, and journal entry preparation.",
      impact: answers["manual-effort"] <= 25 ? "high" : "medium",
    });
  }

  // ── ERP system ──
  if (answers["erp-system"] !== undefined && answers["erp-system"] <= 45) {
    recs.push({
      category: "automation",
      title: "Consider upgrading your accounting system",
      description:
        "Small-business tools and spreadsheets cap how much you can automate. A purpose-built ERP (like NetSuite or Sage Intacct) unlocks automated reconciliations, journal workflows, and real-time reporting.",
      impact: "medium",
    });
  }

  // ── Bank feeds ──
  if (answers["bank-feeds"] !== undefined && answers["bank-feeds"] <= 40) {
    recs.push({
      category: "automation",
      title: "Automate bank feeds and reconciliation",
      description:
        "Manually downloading and entering bank transactions is slow and error-prone. Automated bank feeds integrated with your ERP can eliminate hours of work and catch discrepancies faster.",
      impact: "high",
    });
  }

  // ── Journal entries ──
  if (answers["journal-entries"] !== undefined && answers["journal-entries"] <= 40) {
    recs.push({
      category: "automation",
      title: "Automate journal entry workflows",
      description:
        "Building entries from scratch each month wastes time and invites errors. Implement recurring journal schedules, standardized templates, and automated approval routing.",
      impact: "medium",
    });
  }

  // ── Reconciliation coverage ──
  if (answers["recon-coverage"] !== undefined && answers["recon-coverage"] <= 50) {
    recs.push({
      category: "controls",
      title: "Increase reconciliation coverage",
      description:
        "Reconciling fewer than 75% of balance sheet accounts leaves material risk undetected. Prioritize high-risk and high-balance accounts first, and work toward 100% monthly coverage.",
      impact: "high",
    });
  }

  // ── Balance sheet accounts complexity ──
  if (answers["balance-sheet-accounts"] !== undefined && answers["balance-sheet-accounts"] <= 30) {
    recs.push({
      category: "controls",
      title: "Simplify your chart of accounts",
      description:
        "A large, bloated chart of accounts creates unnecessary reconciliation burden and slows the close. Review for dormant, redundant, or overly granular accounts that can be consolidated.",
      impact: "low",
    });
  }

  // ── Flux / variance analysis ──
  if (answers["flux-analysis"] !== undefined && answers["flux-analysis"] <= 50) {
    recs.push({
      category: "controls",
      title: "Formalize flux and variance analysis",
      description:
        "Without systematic variance analysis, material misstatements can go undetected. Define documented thresholds, automate flagging, and require written explanations before close sign-off.",
      impact: answers["flux-analysis"] <= 25 ? "high" : "medium",
    });
  }

  // ── External audit readiness ──
  if (answers["external-audit"] !== undefined && answers["external-audit"] <= 45 && answers["external-audit"] !== 60) {
    recs.push({
      category: "controls",
      title: "Strengthen audit readiness",
      description:
        "If your audit requires a scramble every year — or worse, regularly surfaces findings — your close process has gaps. Focus on continuous documentation, reconciliation completeness, and audit trail integrity.",
      impact: "high",
    });
  }

  // ── Close team size ──
  if (answers["close-team-size"] !== undefined && answers["close-team-size"] <= 50) {
    recs.push({
      category: "speed",
      title: "Optimize your close team structure",
      description:
        answers["close-team-size"] === 50
          ? "A 1–2 person close team carries significant key-person risk. Cross-train team members, document procedures, and consider where automation can reduce dependency on individuals."
          : "Large close teams face coordination overhead and handoff delays. Clarify role ownership, reduce dependencies between tasks, and look for steps that can be automated or eliminated.",
      impact: "medium",
    });
  }

  // ── Close tracking ──
  if (answers["close-tracking"] !== undefined && answers["close-tracking"] <= 50) {
    recs.push({
      category: "visibility",
      title: "Implement close task tracking",
      description:
        "Without real-time visibility into close progress, bottlenecks go undetected and deadlines slip. A structured close checklist with status tracking and owners is the minimum standard.",
      impact: "medium",
    });
  }

  // ── Close documentation ──
  if (answers["close-documentation"] !== undefined && answers["close-documentation"] <= 40) {
    recs.push({
      category: "visibility",
      title: "Document your close process",
      description:
        "When the close process lives in people's heads, you're one resignation away from chaos. Create SOPs for each close task, maintain a central runbook, and review it quarterly.",
      impact: answers["close-documentation"] <= 15 ? "high" : "medium",
    });
  }

  const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return recs;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 82) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Average";
  if (score >= 35) return "Below Average";
  return "Needs Attention";
}

export function getScoreColor(score: number): string {
  if (score >= 82) return "#059669";
  if (score >= 65) return "#0891b2";
  if (score >= 50) return "#d97706";
  if (score >= 35) return "#ea580c";
  return "#dc2626";
}

export function getCategoryBenchmarkPosition(
  categoryKey: CategoryKey,
  score: number
): "top" | "above-median" | "below-median" | "bottom" {
  const b = benchmarks.categories[categoryKey];
  if (score >= b.topQuartile) return "top";
  if (score >= b.median) return "above-median";
  if (score >= b.bottomQuartile) return "below-median";
  return "bottom";
}

export function getStrongestAndWeakest(
  categoryScores: Record<CategoryKey, number>
): { strongest: CategoryKey; weakest: CategoryKey } {
  const keys = Object.keys(categoryScores) as CategoryKey[];
  let strongest = keys[0];
  let weakest = keys[0];
  for (const key of keys) {
    if (categoryScores[key] > categoryScores[strongest]) strongest = key;
    if (categoryScores[key] < categoryScores[weakest]) weakest = key;
  }
  return { strongest, weakest };
}

export function countCategoriesAboveMedian(
  categoryScores: Record<CategoryKey, number>
): number {
  return (Object.keys(categoryScores) as CategoryKey[]).filter(
    (key) => categoryScores[key] >= benchmarks.categories[key].median
  ).length;
}

// ─── Close Archetype engine ───────────────────────────────────────────────────

export interface CloseArchetype {
  title: string;
  description: string;
  color: string;
}

export function getCloseArchetype(
  categoryScores: Record<CategoryKey, number>,
  overallScore: number
): CloseArchetype {
  const { speed, automation, controls, visibility } = categoryScores;

  // 1. Top performer — everything is humming
  if (overallScore >= 85) {
    return {
      title: "The Close Machine",
      description:
        "Your close runs like clockwork. Fast, automated, controlled, and transparent — this is what best-in-class looks like.",
      color: "#059669",
    };
  }

  // 2. IPO-ready — strong overall with great controls
  if (overallScore >= 75 && controls >= 75) {
    return {
      title: "IPO-Ready Operator",
      description:
        "Strong controls, solid speed, and good documentation. You could walk into a SOX audit tomorrow and sleep fine tonight.",
      color: "#059669",
    };
  }

  // 3. Speed Demon — fast but risky
  if (speed >= 75 && controls < 50) {
    return {
      title: "The Speed Demon",
      description:
        "You close fast — impressively fast. But your auditor just felt a chill down their spine. Controls need love.",
      color: "#ea580c",
    };
  }

  // 4. Audit-Ready but Slow — bulletproof controls, glacial pace
  if (controls >= 70 && speed < 55) {
    return {
      title: "Audit-Ready but Slow",
      description:
        "Your controls are airtight, but the close drags on. The good news: you have a strong foundation to accelerate from.",
      color: "#0891b2",
    };
  }

  // 5. Dashboard Dreamer — great visibility, weak execution
  if (visibility >= 70 && (automation < 50 || speed < 50)) {
    return {
      title: "The Dashboard Dreamer",
      description:
        "You can see every bottleneck in beautiful real-time dashboards. You just can't fix them yet.",
      color: "#7c3aed",
    };
  }

  // 6. Scalable Close Foundation — good automation, decent overall
  if (overallScore >= 65 && automation >= 65) {
    return {
      title: "Scalable Close Foundation",
      description:
        "You've invested in automation and it shows. A few targeted improvements and you're knocking on top-quartile's door.",
      color: "#0891b2",
    };
  }

  // 7. The Lone Wolf Controller — strong controls, low visibility (no one else knows what's happening)
  if (controls >= 65 && visibility < 40) {
    return {
      title: "The Lone Wolf Controller",
      description:
        "The close lives in your head (and maybe one spreadsheet). It works, but only because you never take vacation.",
      color: "#d97706",
    };
  }

  // 8. Partially Automated but Fragile — some automation, weak controls
  if (automation >= 50 && controls < 45) {
    return {
      title: "Partially Automated but Fragile",
      description:
        "You've started automating — nice. But one broken formula or missed edge case could unravel the whole thing.",
      color: "#d97706",
    };
  }

  // 9. The Black Box Close — low visibility, somehow gets done
  if (visibility < 35 && overallScore >= 45) {
    return {
      title: "The Black Box Close",
      description:
        "The books get closed every month — no one can fully explain how. Institutional knowledge is doing the heavy lifting.",
      color: "#71717a",
    };
  }

  // 10. The Steady Operator — decent everywhere, not exceptional
  if (overallScore >= 55) {
    return {
      title: "The Steady Operator",
      description:
        "Reliable and consistent — your close gets done without drama. Smart investments in automation will take it to the next level.",
      color: "#0891b2",
    };
  }

  // 11. Excel-Heavy Firefighter — low automation, slow
  if (automation < 40 && speed < 50) {
    return {
      title: "Excel-Heavy Firefighter",
      description:
        "Your close is powered by spreadsheets, heroics, and late nights. The team gets it done, but the burnout is real.",
      color: "#dc2626",
    };
  }

  // 12. The Copy-Paste Closer — very low automation
  if (automation < 40) {
    return {
      title: "The Copy-Paste Closer",
      description:
        "Ctrl+C, Ctrl+V is your most-used shortcut during close week. There's a better way — and your wrists will thank you.",
      color: "#d97706",
    };
  }

  // 13. Duct Tape Close — below average but holding
  if (overallScore >= 35) {
    return {
      title: "The Duct Tape Close",
      description:
        "It's held together by willpower, workarounds, and a few people who know where all the bodies are buried.",
      color: "#d97706",
    };
  }

  // 14. One Bad Month from Chaos — worst tier
  return {
    title: "One Bad Month from Chaos",
    description:
      "Your close process is hanging by a thread. One key person leaving or one surprise transaction could tip things over.",
    color: "#dc2626",
  };
}

export function getBenchmarkVerdict(
  position: DiagnosticResults["benchmarkPosition"]
): { headline: string; description: string } {
  switch (position) {
    case "top":
      return {
        headline: "Top Quartile",
        description:
          "Your close process outperforms most peer organizations. You're operating at a high level of efficiency and control.",
      };
    case "above-median":
      return {
        headline: "Above Median",
        description:
          "Your close process is better than average, but there are clear opportunities to reach top-quartile performance.",
      };
    case "below-median":
      return {
        headline: "Below Median",
        description:
          "Your close process falls behind most peer organizations. Targeted improvements could significantly improve efficiency and reduce risk.",
      };
    case "bottom":
      return {
        headline: "Needs Improvement",
        description:
          "Your close process has significant gaps compared to peers. Addressing foundational issues in automation and controls should be a priority.",
      };
  }
}
