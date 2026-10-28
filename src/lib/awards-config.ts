export type AwardTier = "SILVER" | "GOLD" | "PLATINUM";

export interface AwardMetadata {
  type: AwardTier;
  cost: number;
  label: string;
}

export const PLATFORM_AWARDS: Record<AwardTier, AwardMetadata> = {
  SILVER: { type: "SILVER", cost: 50, label: "🥈 Silver Award" },
  GOLD: { type: "GOLD", cost: 100, label: "🥇 Gold Award" },
  PLATINUM: { type: "PLATINUM", cost: 500, label: "💎 Platinum Award" },
};
