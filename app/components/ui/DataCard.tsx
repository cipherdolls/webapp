import React, { createContext, useContext, useState } from 'react';
import { cn } from '~/utils/cn';
import { Icons } from './icons';

interface DataCardRootProps {
  children: React.ReactNode;
  className?: string;
}

interface DataCardLabelProps {
  children: React.ReactNode;
  className?: string;
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
}

interface DataCardItemLabelProps {
  children: React.ReactNode;
  className?: string;
  collapseTrigger?: boolean;
}

interface DataCardItemDataGridProps {
  className?: string;
  variant?: 'default' | 'secondary';
  data: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
  }>;
}

interface DataCardItemContextType {
  collapsible: boolean;
  isOpen: boolean;
  toggleOpen: () => void;
}

const DataCardItemContext = createContext<DataCardItemContextType>({
  collapsible: false,
  isOpen: false,
  toggleOpen: () => {},
});

function useDataCardItem() {
  return useContext(DataCardItemContext);
}

const CARDS_SIDE_PADDING = 'px-3 md:px-5';

const DataCardRoot: React.FC<DataCardRootProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

const DataCardLabel: React.FC<DataCardLabelProps> = ({ children, className }) => {
  return <h3 className={cn('text-heading-h4 mb-4 px-3', className)}>{children}</h3>;
};

const DataCardWrapper: React.FC<DataCardWrapperProps> = ({ children, className }) => {
  return <div className={cn('bg-white rounded-xl overflow-hidden', className)}>{children}</div>;
};

const DataCardItem: React.FC<DataCardItemProps> = ({ children, className, collapsible = false, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <DataCardItemContext.Provider value={{ collapsible, isOpen, toggleOpen }}>
      <div className={cn('', className)}>{children}</div>
    </DataCardItemContext.Provider>
  );
};

const DataCardItemLabel: React.FC<DataCardItemLabelProps> = ({ children, className }) => {
  const { collapsible, isOpen, toggleOpen } = useDataCardItem();

  const classes = `${CARDS_SIDE_PADDING} flex items-center justify-between text-body-md font-semibold text-base-black py-4 w-full text-left`;

  if (collapsible) {
    return (
      <button className={cn(classes, className)} onClick={toggleOpen}>
        <span>{children}</span>

        <span className={cn('ml-5', isOpen && 'rotate-180')}>
          <Icons.chevronDown />
        </span>
      </button>
    );
  }

  return <h3 className={cn(classes, className)}>{children}</h3>;
};

const DataCardItemDataGrid: React.FC<DataCardItemDataGridProps> = ({ className, data, variant = 'default' }) => {
  return (
    <dl
      className={cn(
        `${CARDS_SIDE_PADDING}`,
        variant === 'default' && 'py-4 space-y-3',
        variant === 'secondary' && 'divide-y divide-dashed divide-neutral-03 bg-neutral-05',
        className
      )}
    >
      {data.map((item, index) => {
        return (
          <div key={index} className={cn('flex justify-between text-body-sm gap-4', variant === 'secondary' && 'py-3')}>
            <dt
              className={cn('text-neutral-01', {
                'text-base-black': variant === 'secondary',
              })}
            >
              {item.label}
            </dt>
            <dd className='font-semibold'>{item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
};

interface DataCardTextProps {
  children: React.ReactNode;
  className?: string;
}

const DataCardText: React.FC<DataCardTextProps> = ({ children, className }) => {
  return (
    <div className={cn(`${CARDS_SIDE_PADDING} py-4 md:bg-neutral-05 md:py-6`, className)}>
      <p className='text-body-sm text-neutral-01 md:text-base-black'>{children}</p>
    </div>
  );
};

interface DataCardDividerProps {
  className?: string;
}

const DataCardDivider: React.FC<DataCardDividerProps> = ({ className }) => {
  return <hr className={cn('border-neutral-04', className)} />;
};

interface DataCardItemCollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

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

export const DataCard = {
  Root: DataCardRoot,
  Label: DataCardLabel,
  Wrapper: DataCardWrapper,
  Item: DataCardItem,
  ItemLabel: DataCardItemLabel,
  Text: DataCardText,
  Divider: DataCardDivider,
  ItemDataGrid: DataCardItemDataGrid,
  ItemCollapsibleContent: DataCardItemCollapsibleContent,
};
