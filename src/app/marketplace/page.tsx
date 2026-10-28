import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import Link from "next/link";

// Explicitly inform Next.js 16 to treat this parameter-dependent route as a dynamic server page
export const instant = false;

export default async function MarketplacePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // 1. Query all active digital assets listed in the marketplace ledger
    const activeItems = await db.marketplaceItem.findMany({
        where: { isActive: true },
        include: {
            creator: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    // 2. Fetch the user's current inventory map to identify already purchased items
    const userInventory = await db.userAsset.findMany({
        where: { userId: session.user.id },
        select: { itemId: true },
    });

    const ownedItemIds = new Set(userInventory.map((asset) => asset.itemId));

    return (
        <div className="py-8 max-w-5xl mx-auto space-y-6 px-4 animate-fadeIn">
            {/* FIXED: Flex row header mapping providing immediate navigation triggers for creators */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 select-none">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                        🏪 Creator Digital Asset Marketplace
                    </h1>
                    <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mt-1">
                        Spend your earned platform coins to unlock exclusive visual border glows, text style skins, and identity flairs.
                    </p>
                </div>

                {/* INJECTED SHORTCUT LINK BUTTON: Takes users directly to the creation workspace panel */}
                <Link
                    href="/marketplace/create"
                    className="px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-950 hover:bg-gray-800 dark:hover:bg-gray-100 text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-xs shrink-0 text-center"
                >
                    🎨 Asset Creator Studio
                </Link>
            </div>

            {activeItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 font-medium italic shadow-sm text-xs select-none">
                    🏪 Storefront Empty: No custom creator assets have been published for trade yet. Check back shortly!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeItems.map((item) => (
                        <MarketplaceItemCard
                            key={item.id}
                            itemId={item.id}
                            title={item.title}
                            assetType={item.assetType}
                            price={item.price}
                            styleValue={item.styleValue}
                            creatorUsername={item.creator.username || "anonymous"}
                            isOwned={ownedItemIds.has(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
