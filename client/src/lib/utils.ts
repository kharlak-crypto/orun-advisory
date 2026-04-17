import { clsx, type ClassValue } from "clsx";

/**
 * Utility for merging Tailwind class names conditionally.
 * Usage: cn("base-class", condition && "conditional-class", { "object-class": bool })
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
