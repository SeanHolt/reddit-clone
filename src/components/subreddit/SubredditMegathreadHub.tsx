import Link from "next/link";

interface MegathreadLinkItem {
  id: string;
  title: string;
  url: string;
}

interface SubredditMegathreadHubProps {
  links: MegathreadLinkItem[];
}

export function SubredditMegathreadHub({ links }: SubredditMegathreadHubProps) {
  if (links.length === 0) return null;

  return (
    <div className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 dark:border-orange-500/30 rounded-xl p-3.5 space-y-2 select-none animate-fadeIn">
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <span>📌 Community Megathread & Sticky Resources</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-0.5">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition shadow-xs flex items-center gap-1"
          >
            <span>🔗</span>
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}
