import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { texts } from './tv';

export { type ClassValue } from 'clsx';

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: Object.keys(texts),
        },
      ],
    },
  },
};

const customTwMerge = extendTailwindMerge(twMergeConfig);

/**
 * Utilizes `clsx` with `tailwind-merge`, use in cases of possible class conflicts.
 */
export function cnExt(...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes));
}

/**
 * A direct export of `clsx` without `tailwind-merge`.
 */
export const cn = clsx;
