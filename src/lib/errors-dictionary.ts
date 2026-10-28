export type PlatformErrorCode =
  | "AUTOMOD_BLOCKED"
  | "RESTRICTION_GATE_AGE"
  | "RESTRICTION_GATE_KARMA"
  | "USER_BANNED"
  | "SUBREDDIT_LOCKED"
  | "UNAUTHORIZED_ACTION"
  | "MISSING_PAYLOAD"
  | "SERVER_CRASH"
  | "UNKNOWN_ERROR";

/**
 * Global dictionary translating system code markers into 
 * friendly, actionable, non-technical context messages.
 */
export const API_ERROR_DICTIONARY: Record<PlatformErrorCode, string> = {
  AUTOMOD_BLOCKED: "🔒 Submission Blocked: Your text contains words or phrases prohibited by this community's safety filters.",
  RESTRICTION_GATE_AGE: "⏳ Access Restricted: Your profile account is too new to submit posts to this specific community yet.",
  RESTRICTION_GATE_KARMA: "💸 Transaction Interrupted: You do not hold enough platform coins inside your wallet balance to purchase this award.",
  USER_BANNED: "🚫 Enforcement Ban: You are currently restricted or suspended from interacting inside this community space.",
  SUBREDDIT_LOCKED: "🔒 Subreddit Lockdown: This community has paused all fresh thread submissions temporarily during an active safety review.",
  UNAUTHORIZED_ACTION: "🔑 Verification Error: Please claim a valid username handle or log in before performing this action.",
  MISSING_PAYLOAD: "📁 Data Error: Some required entry field inputs are invalid or missing character parameters.",
  SERVER_CRASH: "⚡ Network Timeout: Our database engines are currently experiencing high volume. Please try again shortly.",
  UNKNOWN_ERROR: "⚠️ Connection Interrupted: Something unexpected went wrong. Please check your data feed link.",
};

/**
 * Safe recovery utility function parsing server codes cleanly.
 */
export function getFriendlyErrorMessage(code: string | null | undefined): string {
  if (!code) return API_ERROR_DICTIONARY.UNKNOWN_ERROR;
  const normalized = code.toUpperCase() as PlatformErrorCode;
  return API_ERROR_DICTIONARY[normalized] || API_ERROR_DICTIONARY.UNKNOWN_ERROR;
}
