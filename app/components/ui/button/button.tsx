import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { PolymorphicComponentProps } from '~/utils/polymorphic';
import { recursiveCloneChildren } from '~/utils/recursive-clone-children';
import { tv, type VariantProps } from '~/utils/tv';

const BUTTON_ROOT_NAME = 'ButtonRoot';
const BUTTON_ICON_NAME = 'ButtonIcon';

export const buttonVariants = tv({
  slots: {
    root: [
      // base
      'group relative inline-flex items-center justify-center whitespace-nowrap outline-none rounded-full',
      'transition duration-200 ease-out',
      // focus
      'focus:outline-none',
      // disabled
      'disabled:pointer-events-none disabled:bg-neutral-05 disabled:text-neutral-03 disabled:select-none',
    ],
    icon: [
      // base
      'flex size-5 shrink-0 items-center justify-center',
    ],
  },
  variants: {
    variant: {
      primary: {},
      secondary: {},
      white: {},
      ghost: {},
      danger: {},
    },
    size: {
      lg: {
        root: 'h-14 gap-1 font-semibold text-body-lg',
        icon: '-mx-1',
      },
      md: {
        root: 'h-12 gap-1 font-semibold text-body-md',
        icon: '-mx-1',
      },
      sm: {
        root: 'h-10 gap-1 font-semibold text-body-sm',
        icon: '-mx-0.5',
      },
      icon: {
        root: 'size-10',
      },
    },
    responsive: {
      true: {},
    },
  },
  compoundVariants: [
    // Primary variant
    {
      variant: 'primary',
      class: {
        root: [
          // base
          'bg-base-black text-base-white',
          // hover
          'hover:bg-base-black/80',
          // focus
          'focus-visible:ring-2 focus-visible:ring-base-black focus-visible:ring-offset-2',
        ],
      },
    },
    // Secondary variant
    {
      variant: 'secondary',
      class: {
        root: [
          // base
          'bg-neutral-04 text-base-black',
          // hover
          'hover:bg-neutral-04/80',
          // focus
          'focus-visible:ring-2 focus-visible:ring-neutral-04 focus-visible:ring-offset-2',
        ],
      },
    },
     // White variant
    {
      variant: 'white',
      class: {
        root: [
          // base
          'bg-white text-black',
          // hover
          'hover:bg-white/80',
          // focus
          'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
        ],
      },
    },
    // Ghost variant
    {
      variant: 'ghost',
      class: {
        root: [
          // base
          'bg-transparent text-base-black',
          // hover
          'hover:bg-gray-100', // TODO: Fix here
          // focus
          'focus-visible:ring-2 focus-visible:ring-gray-400',
        ],
      },
    },
    // Danger variant
    {
      variant: 'danger',
      class: {
        root: [
          // base
          'bg-specials-danger text-white',
          // hover
          'hover:bg-specials-danger/80',
          // focus
          'focus-visible:ring-2 focus-visible:ring-specials-danger focus-visible:ring-offset-2',
        ],
      },
    },

    {
      size: 'lg',
      responsive: true,
      class: {
        root: 'text-body-md sm:text-body-lg',
      },
    },
    {
      size: 'md',
      responsive: true,
      class: {
        root: 'text-body-sm sm:text-body-md',
      },
    },
  ],

  defaultVariants: {
    variant: 'primary',
    size: 'md',
    responsive: false,
  },
});

type ButtonSharedProps = VariantProps<typeof buttonVariants>;

type ButtonRootProps = VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  ({ children, variant, size, responsive, asChild, className, ...rest }, forwardedRef) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const { root } = buttonVariants({ variant, size, responsive });

    const sharedProps: ButtonSharedProps = {
      variant,
      size,
      responsive,
    };

    const extendedChildren = recursiveCloneChildren(children as React.ReactElement[], sharedProps, [BUTTON_ICON_NAME], uniqueId, asChild);

    return (
      <Component ref={forwardedRef} className={root({ class: className })} {...rest}>
        {extendedChildren}
      </Component>
    );
  }
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

function ButtonIcon<T extends React.ElementType>({
  variant,
  size,
  responsive,
  as,
  className,
  children,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps> & { children?: React.ReactNode }) {
  const Component = as || 'div';
  const { icon } = buttonVariants({ variant, size, responsive });

  // If Component is a React component (like an icon) and no children provided,
  // render it directly with the icon classes
  if (typeof as === 'function' && !children) {
    return <Component className={icon({ class: className })} {...rest} />;
  }

  // Otherwise render as container with children
  return (
    <Component className={icon({ class: className })} {...rest}>
      {children}
    </Component>
  );
}
ButtonIcon.displayName = BUTTON_ICON_NAME;

export { ButtonRoot as Root, ButtonIcon as Icon };
