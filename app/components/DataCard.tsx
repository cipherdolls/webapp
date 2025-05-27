import React, { createContext, useContext, useState } from 'react';
import { cn, cnExt } from '~/utils/cn';
import { Icons } from './ui/icons';
import { useNavigate } from 'react-router';

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTS                                  */
/* -------------------------------------------------------------------------- */

const CARDS_SIDE_PADDING = 'px-3 md:px-5';

/* -------------------------------------------------------------------------- */
/*                                  INTERFACES                                */
/* -------------------------------------------------------------------------- */

interface DataCardRootProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardLabelProps {
  children: React.ReactNode;
  className?: string;
  extra?: React.ReactNode;
}

interface DataCardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardItemProps {
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  onClick?: () => void;
  href?: string;
}

interface DataCardItemLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardItemDataGridProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'mobile';
  data: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
  }>;
}

interface DataCardTextProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardDividerProps {
  className?: string;
}

interface DataCardItemCollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardItemContextType {
  collapsible: boolean;
  isOpen: boolean;
  toggleOpen: () => void;
  onClick?: () => void;
  href?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  CONTEXT                                   */
/* -------------------------------------------------------------------------- */

const DataCardItemContext = createContext<DataCardItemContextType>({
  collapsible: false,
  isOpen: false,
  toggleOpen: () => {},
  onClick: undefined,
  href: undefined,
});

function useDataCardItem() {
  return useContext(DataCardItemContext);
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

/** Root container for the DataCard */
const DataCardRoot: React.FC<DataCardRootProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

/** Label component for the DataCard */
const DataCardLabel: React.FC<DataCardLabelProps> = ({ children, className, extra }) => {
  return (
    <div className={cnExt('flex items-center justify-between mb-4 px-0 gap-3', className)}>
      <h3 className={cn('text-heading-h3', className)}>{children}</h3>
      {extra && <div className='flex items-end max-w-[40%] text-right'>{extra}</div>}
    </div>
  );
};

/** Wrapper with background and border radius */
const DataCardWrapper: React.FC<DataCardWrapperProps> = ({ children, className }) => {
  return <div className={cn('bg-white rounded-xl overflow-hidden shadow-regular', className)}>{children}</div>;
};

/** DataCard Item which can optionally be collapsible */
const DataCardItem: React.FC<DataCardItemProps> = ({ children, className, collapsible = false, defaultOpen = false, onClick, href }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const navigate = useNavigate();

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger navigation if clicking on excluded elements
    const element = e.target as Element;
    const isExcluded =
      element.classList.contains('navigation-exclude') ||
      !!element.closest('.navigation-exclude') ||
      element instanceof HTMLButtonElement ||
      element instanceof HTMLAnchorElement ||
      !!element.closest('button') ||
      !!element.closest('a');

    if (isExcluded) {
      return;
    }

    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const isClickable = onClick || href;

  return (
    <DataCardItemContext.Provider value={{ collapsible, isOpen, toggleOpen, onClick, href }}>
      <div
        className={cn('', isClickable && 'cursor-pointer hover:bg-neutral-05 transition-colors relative group', className)}
        onClick={isClickable ? handleItemClick : undefined}
      >
        {isClickable && (
          <div className='absolute left-0 right-0 bottom-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity z-20'></div>
        )}
        {children}
      </div>
    </DataCardItemContext.Provider>
  );
};

/** Label for a DataCard Item. Renders a button if collapsible */
const DataCardItemLabel: React.FC<DataCardItemLabelProps> = ({ children, className }) => {
  const { collapsible, isOpen, toggleOpen } = useDataCardItem();

  const classes = `${CARDS_SIDE_PADDING} flex items-center justify-between text-body-md font-semibold text-base-black pt-4 w-full text-left`;

  if (collapsible) {
    return (
      <button className={cn(classes, className, isOpen && 'pb-4')} onClick={toggleOpen}>
        <span>{children}</span>

        <span className={cn('ml-5', isOpen && 'rotate-180')}>
          <Icons.chevronDown />
        </span>
      </button>
    );
  }

  return <h3 className={cn(classes, className)}>{children}</h3>;
};

/** Data grid to display label-value pairs within a DataCard item */
const DataCardItemDataGrid: React.FC<DataCardItemDataGridProps> = ({ className, data, variant = 'default' }) => {
  return (
    <dl
      className={cn(
        `${CARDS_SIDE_PADDING}`,
        variant === 'default' || 'mobile' ? 'py-4 space-y-3' : '',
        variant === 'secondary' && 'divide-y divide-dashed divide-neutral-03 bg-neutral-05',
        className
      )}
    >
      {data.map((item, index) => {
        return (
          <div
            key={index}
            className={cn('flex justify-between text-body-sm gap-4', variant === 'secondary' && 'py-3', variant === 'mobile' && '!gap-0')}
          >
            <dt
              className={cn('text-neutral-01', {
                'text-base-black': variant === 'secondary',
              })}
            >
              {item.label}
            </dt>
            <dd className={cn('overflow-hidden font-semibold text-right', variant === 'mobile' && 'w-full')}>{item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};

/** Text component for additional DataCard details */
const DataCardText: React.FC<DataCardTextProps> = ({ children, className }) => {
  return (
    <div className={cn(`${CARDS_SIDE_PADDING} py-4 md:bg-neutral-05 md:py-6`, className)}>
      <p className='text-body-sm text-neutral-01 md:text-base-black whitespace-pre-line'>{children}</p>
    </div>
  );
};

/** Divider for separating DataCard sections */
const DataCardDivider: React.FC<DataCardDividerProps> = ({ className }) => {
  return (
    <div className={CARDS_SIDE_PADDING}>
      <hr className={cn('border-neutral-04 ', className)} />
    </div>
  );
};

/** Collapsible content within a DataCard Item */
const DataCardItemCollapsibleContent: React.FC<DataCardItemCollapsibleContentProps> = ({ children, className }) => {
  const { collapsible, isOpen } = useDataCardItem();

  if (!collapsible) return <>{children}</>;
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'grid overflow-hidden transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
    >
      <div className='overflow-hidden'>{children}</div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              EXPORT COMPONENT                              */
/* -------------------------------------------------------------------------- */
export const DataCard = {
  Root: DataCardRoot,
  Label: DataCardLabel,
  Wrapper: DataCardWrapper,
  Text: DataCardText,
  Divider: DataCardDivider,
  Item: DataCardItem,
  ItemLabel: DataCardItemLabel,
  ItemDataGrid: DataCardItemDataGrid,
  ItemCollapsibleContent: DataCardItemCollapsibleContent,
};
