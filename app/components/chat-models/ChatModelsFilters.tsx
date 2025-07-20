import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Popover from '~/components/ui/popover';
import { Icons } from '~/components/ui/icons';

type LocalFilters = {
  contextWindowMin: string;
  contextWindowMax: string;
  dollarPerInputTokenMin: string;
  dollarPerInputTokenMax: string;
  dollarPerOutputTokenMin: string;
  dollarPerOutputTokenMax: string;
  recommended: boolean;
  censored: boolean;
};

type ChatModelsFiltersProps = {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  localFilters: LocalFilters;
  onLocalFilterChange: (key: string, value: string | boolean) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

// Separate component to prevent re-creation on every render
function FilterInputs({ 
  localFilters, 
  onLocalFilterChange 
}: { 
  localFilters: LocalFilters; 
  onLocalFilterChange: (key: string, value: string | boolean) => void;
}) {
  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Context Window (Min)</label>
          <Input.Root>
            <Input.Input
              type='number'
              placeholder='e.g. 4000'
              value={localFilters.contextWindowMin}
              onChange={(e) => onLocalFilterChange('contextWindowMin', e.target.value)}
            />
          </Input.Root>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Context Window (Max)</label>
          <Input.Root>
            <Input.Input
              type='number'
              placeholder='e.g. 128000'
              value={localFilters.contextWindowMax}
              onChange={(e) => onLocalFilterChange('contextWindowMax', e.target.value)}
            />
          </Input.Root>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Input Price Min ($)</label>
          <Input.Root>
            <Input.Input
              type='number'
              step='0.000001'
              placeholder='e.g. 0.000001'
              value={localFilters.dollarPerInputTokenMin}
              onChange={(e) => onLocalFilterChange('dollarPerInputTokenMin', e.target.value)}
            />
          </Input.Root>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Input Price Max ($)</label>
          <Input.Root>
            <Input.Input
              type='number'
              step='0.000001'
              placeholder='e.g. 0.00001'
              value={localFilters.dollarPerInputTokenMax}
              onChange={(e) => onLocalFilterChange('dollarPerInputTokenMax', e.target.value)}
            />
          </Input.Root>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Output Price Min ($)</label>
          <Input.Root>
            <Input.Input
              type='number'
              step='0.000001'
              placeholder='e.g. 0.000001'
              value={localFilters.dollarPerOutputTokenMin}
              onChange={(e) => onLocalFilterChange('dollarPerOutputTokenMin', e.target.value)}
            />
          </Input.Root>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-neutral-01'>Output Price Max ($)</label>
          <Input.Root>
            <Input.Input
              type='number'
              step='0.000001'
              placeholder='e.g. 0.00001'
              value={localFilters.dollarPerOutputTokenMax}
              onChange={(e) => onLocalFilterChange('dollarPerOutputTokenMax', e.target.value)}
            />
          </Input.Root>
        </div>
      </div>

      <div className='flex flex-wrap gap-4 mt-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox.Root
            id='recommended'
            checked={localFilters.recommended}
            onCheckedChange={(checked) => onLocalFilterChange('recommended', !!checked)}
            className='flex size-4 appearance-none items-center justify-center rounded-sm border border-neutral-04 bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary'
          >
            <Checkbox.Indicator className='text-white'>
              <Icons.check className='size-3' />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label 
            htmlFor='recommended' 
            className='text-sm font-medium text-neutral-01 cursor-pointer'
            onClick={() => onLocalFilterChange('recommended', !localFilters.recommended)}
          >
            Recommended only
          </label>
        </div>

        <div className='flex items-center space-x-2'>
          <Checkbox.Root
            id='censored'
            checked={localFilters.censored}
            onCheckedChange={(checked) => onLocalFilterChange('censored', !!checked)}
            className='flex size-4 appearance-none items-center justify-center rounded-sm border border-neutral-04 bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary'
          >
            <Checkbox.Indicator className='text-white'>
              <Icons.check className='size-3' />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label 
            htmlFor='censored' 
            className='text-sm font-medium text-neutral-01 cursor-pointer'
            onClick={() => onLocalFilterChange('censored', !localFilters.censored)}
          >
            Censored only
          </label>
        </div>
      </div>
    </>
  );
}

export function ChatModelsFilters({
  hasActiveFilters,
  activeFilterCount,
  localFilters,
  onLocalFilterChange,
  onApplyFilters,
  onResetFilters,
}: ChatModelsFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleApply = () => {
    onApplyFilters();
    setFiltersOpen(false);
  };

  const handleReset = () => {
    onResetFilters();
    setFiltersOpen(false);
  };

  return (
    <div className='flex items-center justify-end'>
      {/* Desktop Filters Popover */}
      <div className='hidden md:block'>
        <Popover.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Popover.Trigger asChild>
            <Button.Root
              variant={hasActiveFilters ? 'primary' : 'secondary'}
              className='px-3.5 sm:px-5 sm:h-12 h-10'
            >
              <Button.Icon as={Icons.preferences} />
              Filters
              {hasActiveFilters && (
                <span className='ml-1 bg-white text-black rounded-full size-5 text-xs flex items-center justify-center'>
                  {activeFilterCount}
                </span>
              )}
            </Button.Root>
          </Popover.Trigger>
          <Popover.Content side='bottom' align='end' className='w-[600px] max-h-[80vh] overflow-y-auto'>
            <div className='p-5'>
              <h3 className='text-lg font-semibold mb-4'>Filter Chat Models</h3>
              <FilterInputs localFilters={localFilters} onLocalFilterChange={onLocalFilterChange} />
              <div className='flex justify-between mt-4 pt-4 border-t border-neutral-04'>
                <Button.Root onClick={handleReset} variant='secondary' className='px-4 py-2'>
                  Reset
                </Button.Root>
                <Button.Root onClick={handleApply} variant='primary' className='px-4 py-2'>
                  Apply Filters
                </Button.Root>
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>

      {/* Mobile Filters Button */}
      <div className='md:hidden'>
        <Button.Root
          onClick={() => setFiltersOpen(!filtersOpen)}
          variant={hasActiveFilters ? 'primary' : 'secondary'}
          className='px-3.5 h-10'
        >
          <Button.Icon as={Icons.preferences} />
          Filters
          {hasActiveFilters && (
            <span className='ml-1 bg-white text-black rounded-full size-5 text-xs flex items-center justify-center'>
              {activeFilterCount}
            </span>
          )}
        </Button.Root>
      </div>

      {/* Mobile Filters Panel */}
      {filtersOpen && (
        <div className='md:hidden fixed inset-0 z-50 bg-black/50' onClick={() => setFiltersOpen(false)}>
          <div className='absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-5 max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Filter Chat Models</h3>
              <button onClick={() => setFiltersOpen(false)} className='p-1'>
                <Icons.close className='size-5' />
              </button>
            </div>
            <div className='grid grid-cols-1 gap-4'>
              <FilterInputs localFilters={localFilters} onLocalFilterChange={onLocalFilterChange} />
              <div className='flex justify-between pt-4 border-t border-neutral-04 gap-3'>
                <Button.Root onClick={handleReset} variant='secondary' className='flex-1 px-4 py-2'>
                  Reset
                </Button.Root>
                <Button.Root onClick={handleApply} variant='primary' className='flex-1 px-4 py-2'>
                  Apply Filters
                </Button.Root>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { LocalFilters };