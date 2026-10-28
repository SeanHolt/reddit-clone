import { db } from "@/lib/db";

interface DispatchAuditLogParams {
  subredditId: string;
  moderatorId: string;
  actionType: "BAN_USER" | "UNBAN_USER" | "LOCKDOWN_TOGGLE" | "AUTOMOD_UPDATE" | "MOD_APPOINTED";
  details: string;
}

/**
 * Atomic helper utility that writes an unalterable administrative event 
 * row record directly into the ModAuditLog schema table rows.
 */
export async function dispatchModAuditLog({ subredditId, moderatorId, actionType, details }: DispatchAuditLogParams): Promise<void> {
  try {
    await db.modAuditLog.create({
      data: {
        subredditId,
        moderatorId,
        actionType,
        details: details.trim(),
      },
    });
  } catch (error: unknown) {
    console.error("AUDIT_LOG_DISPATCH_FAULT:", error);
  }
}
