import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge<'text-size'>({
  extend: {
    classGroups: {
      'text-size': ['text-body-sm', 'text-body-md', 'text-body-lg'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
