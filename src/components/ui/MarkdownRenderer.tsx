"use client";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    if (!content) return null;

    const lines = content.split("\n");
    // Simple regular expression to identify a direct image URL inside a line string
    const imageRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp))/i;

    return (
        <div className="text-sm text-gray-700 space-y-3 leading-relaxed break-words">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed === "") return <div key={idx} className="h-1" />;

                // 1. Structural Element Type Narrowing Blocks
                if (trimmed.startsWith("### ")) {
                    return <h4 key={idx} className="text-base font-bold text-gray-900 pt-1">{trimmed.slice(4)}</h4>;
                }
                if (trimmed.startsWith("## ")) {
                    return <h3 key={idx} className="text-lg font-extrabold text-gray-900 pt-1">{trimmed.slice(3)}</h3>;
                }
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                    return <li key={idx} className="list-disc list-inside pl-2 text-gray-600">{trimmed.slice(2)}</li>;
                }
                if (trimmed.startsWith("> ")) {
                    return <blockquote key={idx} className="border-l-4 border-gray-200 pl-3 italic text-gray-500 bg-gray-50/50 py-1 rounded-r">{trimmed.slice(2)}</blockquote>;
                }
                if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
                    return <code key={idx} className="block bg-gray-100 rounded px-3 py-1.5 font-mono text-xs border border-gray-200 whitespace-pre overflow-x-auto">{trimmed.slice(1, -1)}</code>;
                }

                // 2. Standard Paragraph Processing & Inline Bold Parsing (**text**)
                const textParts = trimmed.split("**").map((part, pIdx) =>
                    pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-gray-900 dark:text-white">{part}</strong> : part
                );

                const imageMatch = trimmed.match(imageRegex);
                const matchedUrl = imageMatch ? imageMatch[0] : "";

                return (
                    <div key={idx} className="space-y-2">
                        <p>{textParts}</p>
                        {matchedUrl && (
                            <div className="max-w-lg border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-950 mt-1 animate-fadeIn">
                                <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] text-gray-400 truncate font-mono">
                                    🔗 Link Expansion: {matchedUrl}
                                </div>
                                {/* Updated: Using Next.js Image component layout fill framework logic wrapper */}
                                <div className="h-64 relative w-full flex justify-center bg-gray-900/5 items-center">
                                    <img // Using basic fallback layout rule parameters or Next Image with explicit parameters
                                        src={matchedUrl}
                                        alt="Inline expanding asset attachment"
                                        className="max-h-64 object-contain w-full h-full"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
