export interface ProfileRibbon {
  id: string;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
  emoji: string;
}

interface ComputeRibbonParams {
  postKarma: number;
  commentKarma: number;
  createdAt: Date;
}

/**
 * Pure evaluation engine checking user metadata milestones to reward 
 * high-fidelity visual achievement ribbons natively.
 */
export function computeProfileRibbons({ postKarma, commentKarma, createdAt }: ComputeRibbonParams): ProfileRibbon[] {
  const ribbons: ProfileRibbon[] = [];
  const totalKarma = postKarma + commentKarma;
  
  // 1. Milestone Gate: Evaluate aggregate community reputation tiers
  if (totalKarma >= 5000) {
    ribbons.push({
      id: "elite_reputation",
      label: "Legendary Aura",
      description: "Amassed over 5,000 community karma reputation points.",
      bgClass: "bg-purple-100 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
      textClass: "text-purple-700 dark:text-purple-400",
      emoji: "👑",
    });
  } else if (totalKarma >= 1000) {
    ribbons.push({
      id: "high_reputation",
      label: "Top Contributor",
      description: "Amassed over 1,000 community karma reputation points.",
      bgClass: "bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50",
      textClass: "text-orange-700 dark:text-orange-400",
      emoji: "🔥",
    });
  }

  // 2. Milestone Gate: Evaluate structural account longevity milestones
  const accountAgeMs = Date.now() - new Date(createdAt).getTime();
  const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);

  if (accountAgeDays >= 365) {
    ribbons.push({
      id: "vet_1year",
      label: "1-Year Veteran",
      description: "Dedicated account owner active for over a full operational calendar year.",
      bgClass: "bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
      textClass: "text-blue-700 dark:text-blue-400",
      emoji: "🛡️",
    });
  }

  return ribbons;
}
