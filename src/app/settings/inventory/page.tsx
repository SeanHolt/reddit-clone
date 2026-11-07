import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { InventoryToggleGrid } from "@/components/marketplace/InventoryToggleGrid";

// FIXED: Exempt this dashboard route from static instant pre-rendering validation checks
export const instant = false;

export default async function InventorySettingsPage() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      </div>
      <InventoryToggleGrid initialAssets={unlockedAssets} />
    </div>
  );
}
