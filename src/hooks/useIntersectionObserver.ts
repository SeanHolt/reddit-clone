import { useEffect, useRef, useState } from "react";

/**
 * A ultra-lightweight native hook to observe when a DOM element enters the viewport window.
 */
export function useIntersectionObserver() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    // Use the native browser Intersection Observer API
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: "200px" } // Pre-trigger fetch slightly before user hits the bottom
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return { elementRef, isIntersecting };
}
