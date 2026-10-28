import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { InventoryToggleGrid } from "@/components/marketplace/InventoryToggleGrid";

export const instant = false;

export default async function InventorySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Query the user's complete unlocked collection from the database ledger rows
  const unlockedAssets = await db.userAsset.findMany({
    where: { userId: session.user.id },
    include: {
      item: { select: { id: true, title: true, assetType: true, styleValue: true } }
    },
    orderBy: { acquiredAt: "desc" }
  });

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6 px-4 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 select-none">
          🎒 Custom Identity Vault & Inventory
        </h1>
        <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mt-1">
          Equip, manage, or clear your unlocked marketplace asset cosmetics and profile skins on-the-fly.
        </p>
      </div>

      {unlockedAssets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 font-medium italic shadow-sm text-xs select-none">
          🎒 Inventory Empty: You haven&apos;t unlocked any marketplace asset custom skins yet.
        </div>
      ) : (
        <InventoryToggleGrid initialAssets={unlockedAssets} />
      )}
    </div>
  );
}
