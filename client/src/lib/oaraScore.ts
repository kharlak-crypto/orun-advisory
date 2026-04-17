import type { OaraPillar } from "../../../shared/src/types";

export interface OaraBreakdown {
  pillar: OaraPillar;
  label: string;
  score: number;
  maxScore: number;
}

export const PILLAR_LABELS: Record<OaraPillar, string> = {
  rights_protection:         "Rights Protection",
  institutional_oversight:   "Institutional Oversight",
  safety_risk_management:    "Safety & Risk Management",
  knowledge_transparency:    "Knowledge Transparency",
  accountability_governance: "Accountability Governance",
};

/** Returns a colour class based on 0-100 score */
export function scoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 25) return "text-orange-500";
  return "text-red-600";
}

/** Returns a label based on 0-100 score */
export function scoreLabel(score: number): string {
  if (score >= 75) return "Compliant";
  if (score >= 50) return "Partial";
  if (score >= 25) return "At Risk";
  return "Non-Compliant";
}
