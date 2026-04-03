import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeDate(date: Date | string) {
  return new Intl.RelativeTimeFormat("es-AR", {
    numeric: "auto",
  }).format(
    Math.round(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60),
    ),
    "hour",
  );
}
