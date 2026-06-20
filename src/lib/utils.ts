import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number in Algerian Dinars (DA)
export function formatDA(val: number): string {
  if (val === undefined || val === null) return '0 DA';
  
  if (Math.abs(val) >= 1000000) {
    return (val / 1000000).toFixed(2).replace(/\.00$/, '') + " M DA";
  }
  if (Math.abs(val) >= 1000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + " k DA";
  }
  return val.toLocaleString('fr-FR') + " DA";
}

// Format date into human readable French
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
