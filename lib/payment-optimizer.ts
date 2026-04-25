import type { ClientPaymentMetrics, PaymentAnalytics } from "@/lib/invoice-analyzer";

export type RecommendationPriority = "high" | "medium" | "low";

export type ClientRecommendation = {
  clientName: string;
  priority: RecommendationPriority;
  confidence: "high" | "medium" | "low";
  currentAverageDaysLate: number;
  currentOnTimeRate: number;
  suggestedTermDays: number;
  suggestedDiscountPercent: number;
  expectedDaysAcceleration: number;
  annualCashFlowImpact: number;
  reasoning: string;
};

export type RecommendationBundle = {
  headline: string;
  projectedAnnualCashFlowImpact: number;
  projectedDsoReduction: number;
  strategicActions: string[];
  clientRecommendations: ClientRecommendation[];
};

function round(value: number, digits = 2): number {
  const divisor = 10 ** digits;
  return Math.round(value * divisor) / divisor;
}

function estimateImpact(metrics: ClientPaymentMetrics, targetDaysLate: number): {
  expectedDaysAcceleration: number;
  annualCashFlowImpact: number;
} {
  const expectedDaysAcceleration = Math.max(
    0,
    metrics.averageDaysToPay - Math.max(5, metrics.averageDaysToPay - (metrics.averageDaysLate - targetDaysLate))
  );

  const monthlyRevenue = metrics.totalInvoiced / Math.max(1, metrics.invoices / 12);
  const annualCashFlowImpact = (monthlyRevenue * expectedDaysAcceleration) / 30;

  return {
    expectedDaysAcceleration: round(expectedDaysAcceleration, 1),
    annualCashFlowImpact: round(annualCashFlowImpact)
  };
}

function recommendationForClient(metrics: ClientPaymentMetrics): ClientRecommendation {
  if (metrics.invoices < 2) {
    const impact = estimateImpact(metrics, metrics.averageDaysLate - 1);
    return {
      clientName: metrics.clientName,
      priority: "low",
      confidence: "low",
      currentAverageDaysLate: metrics.averageDaysLate,
      currentOnTimeRate: metrics.onTimeRate,
      suggestedTermDays: 30,
      suggestedDiscountPercent: 0.5,
      expectedDaysAcceleration: impact.expectedDaysAcceleration,
      annualCashFlowImpact: impact.annualCashFlowImpact,
      reasoning:
        "Limited history: keep net 30 but test a small 0.5% early-payment incentive to build behavior data before changing terms."
    };
  }

  if (metrics.averageDaysLate <= -3 && metrics.onTimeRate >= 0.9) {
    const impact = estimateImpact(metrics, -5);
    return {
      clientName: metrics.clientName,
      priority: "medium",
      confidence: "high",
      currentAverageDaysLate: metrics.averageDaysLate,
      currentOnTimeRate: metrics.onTimeRate,
      suggestedTermDays: 15,
      suggestedDiscountPercent: 0,
      expectedDaysAcceleration: impact.expectedDaysAcceleration,
      annualCashFlowImpact: impact.annualCashFlowImpact,
      reasoning:
        "This client consistently pays early. Moving to net 15 protects cash conversion without requiring a discount."
    };
  }

  if (metrics.averageDaysLate > 7 || metrics.onTimeRate < 0.55) {
    const impact = estimateImpact(metrics, 2);
    return {
      clientName: metrics.clientName,
      priority: "high",
      confidence: metrics.variabilityScore > 8 ? "medium" : "high",
      currentAverageDaysLate: metrics.averageDaysLate,
      currentOnTimeRate: metrics.onTimeRate,
      suggestedTermDays: 15,
      suggestedDiscountPercent: 2,
      expectedDaysAcceleration: Math.max(impact.expectedDaysAcceleration, 5),
      annualCashFlowImpact: Math.max(impact.annualCashFlowImpact, 600),
      reasoning:
        "High late-payment risk: shorten terms to net 15 and offer 2% if paid within 7 days to reset payment behavior quickly."
    };
  }

  if (metrics.averageDaysLate > 2 || metrics.onTimeRate < 0.8) {
    const impact = estimateImpact(metrics, 0);
    return {
      clientName: metrics.clientName,
      priority: "high",
      confidence: "high",
      currentAverageDaysLate: metrics.averageDaysLate,
      currentOnTimeRate: metrics.onTimeRate,
      suggestedTermDays: 20,
      suggestedDiscountPercent: 1,
      expectedDaysAcceleration: Math.max(impact.expectedDaysAcceleration, 3),
      annualCashFlowImpact: Math.max(impact.annualCashFlowImpact, 300),
      reasoning:
        "Payment behavior is drifting late. A net 20 policy plus 1% 10-day discount usually improves timing without straining the relationship."
    };
  }

  const impact = estimateImpact(metrics, -1);
  return {
    clientName: metrics.clientName,
    priority: "medium",
    confidence: "high",
    currentAverageDaysLate: metrics.averageDaysLate,
    currentOnTimeRate: metrics.onTimeRate,
    suggestedTermDays: 25,
    suggestedDiscountPercent: 0.5,
    expectedDaysAcceleration: Math.max(impact.expectedDaysAcceleration, 1),
    annualCashFlowImpact: Math.max(impact.annualCashFlowImpact, 120),
    reasoning:
      "This client pays close to terms. A modest net 25 policy with a small early-payment incentive should reduce DSO without margin pressure."
  };
}

export function generatePaymentRecommendations(
  analytics: PaymentAnalytics
): RecommendationBundle {
  const clientRecommendations = analytics.clients
    .map((client) => recommendationForClient(client))
    .sort((a, b) => {
      const priorityRank: Record<RecommendationPriority, number> = {
        high: 0,
        medium: 1,
        low: 2
      };

      if (priorityRank[a.priority] !== priorityRank[b.priority]) {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }

      return b.annualCashFlowImpact - a.annualCashFlowImpact;
    });

  const projectedAnnualCashFlowImpact = round(
    clientRecommendations.reduce((sum, rec) => sum + rec.annualCashFlowImpact, 0)
  );

  const projectedDsoReduction = round(
    clientRecommendations.reduce((sum, rec) => sum + rec.expectedDaysAcceleration, 0) /
      Math.max(clientRecommendations.length, 1),
    1
  );

  const highRiskClients = clientRecommendations.filter((rec) => rec.priority === "high").length;

  return {
    headline:
      highRiskClients > 0
        ? `Prioritize term updates for ${highRiskClients} high-risk client${highRiskClients > 1 ? "s" : ""}.`
        : "Your portfolio is stable; optimize selectively for faster cash conversion.",
    projectedAnnualCashFlowImpact,
    projectedDsoReduction,
    strategicActions: [
      "Segment clients by actual payment behavior instead of applying one default term to everyone.",
      "Deploy discounts only where they move payment timing; avoid blanket discounting.",
      "Review client-level term performance every month and tighten terms for repeat late payers."
    ],
    clientRecommendations
  };
}
