import Link from "next/link";

export function MarketplaceSidebarCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-2.5 transition-colors duration-200 select-none">
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <span>🏪 Marketplace Storefront</span>
      </div>
      
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-normal">
        Got coins to burn? Browse our community collection of glowing comment frames, custom fonts, and premium visual identity flairs!
      </p>

      <Link 
        href="/marketplace"
        className="block w-full py-1.5 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 text-center text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-xs"
      >
        🛍️ Enter Marketplace
      </Link>
    </div>
  );
}
