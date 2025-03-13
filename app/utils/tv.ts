import { createTV } from 'tailwind-variants';

export type { VariantProps, ClassValue } from 'tailwind-variants';

export const texts = {
  'body-sm': '',
  'body-md': '',
  'body-lg': '',
  'heading-h0': '',
  'heading-h1': '',
  'heading-h2': '',
  'heading-h3': '',
  'heading-h4': '',
  label: '',
};

const twMergeConfig = {
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

export const tv = createTV({
  twMergeConfig,
});
