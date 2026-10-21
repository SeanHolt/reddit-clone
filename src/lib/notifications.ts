import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

interface CreateNotificationParams {
  userId: string;
  postId: string;
  type: "REPLY" | "COMMENT" | "MOD_REPORT";
  message: string;
}

/**
 * Creates a notification record atomically inside SQLite for a target recipient.
 * Prevents users from receiving notifications for actions they perform themselves.
 */
export async function createNotification({ userId, postId, type, message }: CreateNotificationParams): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId,
        postId,
        type,
        message,
        isRead: false,
      },
    });
  } catch (error: unknown) {
    logServerError(error, "CREATE_NOTIFICATION_ENGINE");
  }
}
