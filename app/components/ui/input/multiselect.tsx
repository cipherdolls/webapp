import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '~/utils/cn';
import { Icons } from '../icons';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface MultiselectProps<T extends Option = Option> {
  options: T[];
  selectedOptions: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string[];
}

export const Multiselect = <T extends Option>({
  options,
  selectedOptions,
  onChange,
  placeholder = 'Select options',
  className,
  defaultValue,
}: MultiselectProps<T>) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (Array.isArray(defaultValue) && defaultValue.length > 0 && Array.isArray(selectedOptions) && selectedOptions.length === 0) {
      const defaultOptions = options.filter((option) => defaultValue.includes(option.id));
      if (defaultOptions.length > 0) {
        onChange(defaultOptions);
      }
    }
  }, [defaultValue, options, selectedOptions, onChange]);

  const toggleOption = (option: T) => {
    const isSelected = Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id);
    let newSelected: T[];

    if (isSelected) {
      newSelected = selectedOptions.filter((item) => item.id !== option.id);
    } else {
      newSelected = [...(Array.isArray(selectedOptions) ? selectedOptions : []), option];
    }

    onChange(newSelected);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          className={cn(
            'flex min-h-12 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] w-full rounded-xl py-3 px-4 placeholder:text-neutral-02 focus:border-primary focus:outline-none cursor-pointer',
            className
          )}
          role='combobox'
          aria-expanded={open}
        >
          <div className='flex flex-1 flex-wrap gap-1'>
            {Array.isArray(selectedOptions) && selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <div key={option.id} className='flex items-center gap-1 rounded-lg bg-neutral-04 px-2 py-1 text-body-sm font-medium'>
                  {option.name}
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                    className='ml-1 h-4 w-4 rounded-full text-neutral-01 hover:bg-neutral-04 flex items-center justify-center'
                    aria-label={`Remove ${option.name}`}
                  >
                    <Icons.close className='h-3 w-3' />
                  </button>
                </div>
              ))
            ) : (
              <span className='text-neutral-02'>{placeholder}</span>
            )}
          </div>
          <div className='flex items-center self-center'>
            <Icons.chevronDown className={cn('transition-transform ml-2', open && 'rotate-180')} />
          </div>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className='z-50 w-[var(--radix-popover-trigger-width)] p-0 bg-base-white shadow-bottom-level-1 rounded-xl border border-neutral-04 mt-1'
          align='start'
          sideOffset={0}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className='max-h-60 w-full overflow-auto rounded-xl' role='listbox'>
            <div className='p-1 flex flex-col gap-1.5'>
              {options.map((option) => {
                const isSelected = Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      'flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 hover:bg-neutral-04',
                      isSelected && 'bg-neutral-05'
                    )}
                    role='option'
                    aria-selected={isSelected}
                  >
                    <span>{option.name}</span>
                    {isSelected && <Icons.check className='h-4 w-4 text-primary' />}
                  </div>
                );
              })}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Multiselect;
