import React from "react";

interface EmojiAsset {
  shortcode: string;
  base64Data: string;
}

/**
 * High-performance string token scanner that parses `:shortcode:` maps 
 * and substitutes them with inline base64 graphics safely [INDEX].
 */
export function parseInlineCustomEmojis(titleText: string, customEmojis: EmojiAsset[]): React.ReactNode {
  if (customEmojis.length === 0 || !titleText.includes(":")) {
    return titleText;
  }

  const shortcodeMap = new Map(customEmojis.map((e) => [e.shortcode.toLowerCase(), e.base64Data]));
  
  const shortcodePatterns = customEmojis
    .map((e) => e.shortcode.replace(/[-\/\\^\$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");
    
  const regex = new RegExp(`(${shortcodePatterns})`, "gi");
  const segments = titleText.split(regex);

  // FIXED: Explicitly wrap the layout components in a React.createElement Fragment to satisfy parser lint checks [INDEX]
  return React.createElement(
    React.Fragment,
    null,
    segments.map((segment, index) => {
      const matchingBase64 = shortcodeMap.get(segment.toLowerCase());
      
      if (matchingBase64) {
        return React.createElement("img", {
          key: index,
          src: matchingBase64,
          alt: segment,
          className: "h-4 w-4 inline-block align-text-bottom mx-0.5 object-contain select-none",
          title: segment,
        });
      }
      
      return segment;
    })
  );
}
