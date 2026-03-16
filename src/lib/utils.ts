import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const htmlEscapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

const htmlEscapeRegex = /[&<>"'`]/g;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHtml(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value).replace(htmlEscapeRegex, (char) => htmlEscapeMap[char] ?? char);
}
