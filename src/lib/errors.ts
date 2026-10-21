/**
 * Normalizes an unknown thrown error value into a clean, human-readable string.
 * This ensures we never leak internal database stack traces to the user interface.
 */
export function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred.";
}

/**
 * Standard Next.js pattern: Logs server exceptions safely into your terminal console
 * while ensuring that unhandled database or runtime crashes cascade seamlessly
 * into our global src/app/error.tsx boundary view.
 */
export function logServerError(error: unknown, context: string): void {
  const normalized = normalizeError(error);
  console.error(`[SERVER_ERROR_FATAL] [${context}]:`, normalized);
}
