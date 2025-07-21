import { useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import { Icons } from '../icons';

interface Option {
  id: string;
  userId: string;
  name: string;
  [key: string]: any;
}

interface MultiselectProps<T extends Option = Option> {
  userId: string;
  options: T[];
  selectedOptions: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string[];
}

export const Multiselect = <T extends Option>({
  userId,
  options,
  selectedOptions,
  onChange,
  placeholder = 'Select options',
  className,
  defaultValue,
}: MultiselectProps<T>) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const groupOptions = {
    mineScenarios: options.filter((scenario) => scenario.userId === userId),
    publicScenarios: options.filter((scenario) => scenario.userId !== userId),
  };

  useEffect(() => {
    if (Array.isArray(defaultValue) && defaultValue.length > 0 && Array.isArray(selectedOptions) && selectedOptions.length === 0) {
      const defaultOptions = options.filter((option) => defaultValue.includes(option.id));
      if (defaultOptions.length > 0) {
        onChange(defaultOptions);
      }
    }
  }, [defaultValue, options, selectedOptions, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

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
    <div ref={containerRef} className='relative'>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-12 bg-neutral-05 w-full rounded-xl py-3 px-4 placeholder:text-neutral-02 focus:border-primary focus:outline-none cursor-pointer',
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
          <Icons.chevronDown className={cn('transition-transform ml-2 text-neutral-02', open && 'rotate-180')} />
        </div>
      </div>

      {open && (
        <div className='absolute top-full left-0 right-0 z-[60] mt-1 bg-base-white shadow-bottom-level-1 rounded-xl border border-neutral-04'>
          <div className='max-h-60 w-full overflow-auto rounded-xl' role='listbox'>
            <div className='p-1 flex flex-col gap-1.5'>
              {groupOptions.mineScenarios.length > 0 && (
                <>
                  <span className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>Your Scenarios</span>
                  {groupOptions.mineScenarios.map((option) => {
                    const isSelected = Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id);
                    return (
                      <>
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
                          <span className='block'>{option.name}</span>
                          {isSelected && <Icons.check className='h-4 w-4 text-primary' />}
                        </div>
                      </>
                    );
                  })}
                </>
              )}

              {groupOptions.publicScenarios.length > 0 && (
                <>
                  <span className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>Public Scenarios</span>
                  {groupOptions.publicScenarios.map((option) => {
                    const isSelected = Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id);
                    return (
                      <>
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
                          <span className='block'>{option.name}</span>
                          {isSelected && <Icons.check className='h-4 w-4 text-primary' />}
                        </div>
                      </>
                    );
                  })}
                </>
              )}

              {/*{options.map((option) => {*/}
              {/*  const isSelected = Array.isArray(selectedOptions) && selectedOptions.some((item) => item.id === option.id);*/}
              {/*  return (*/}
              {/*    <>*/}
              {/*      <span className='px-2 py-1.5 text-sm font-semibold text-neutral-01'>*/}
              {/*        {userId === option.userId ? 'Your Scenarios' : 'Public Scenarios'}*/}
              {/*      </span>*/}
              {/*      <div*/}
              {/*        key={option.id}*/}
              {/*        onClick={() => toggleOption(option)}*/}
              {/*        className={cn(*/}
              {/*          'flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 hover:bg-neutral-04',*/}
              {/*          isSelected && 'bg-neutral-05'*/}
              {/*        )}*/}
              {/*        role='option'*/}
              {/*        aria-selected={isSelected}*/}
              {/*      >*/}
              {/*        <span className='block'>{option.name}</span>*/}
              {/*        {isSelected && <Icons.check className='h-4 w-4 text-primary' />}*/}
              {/*      </div>*/}
              {/*    </>*/}
              {/*  );*/}
              {/*})}*/}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Multiselect;
