import React from 'react';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';
import { useSearchParams } from 'react-router';
import { useEffect, useRef, useCallback } from 'react';

const SearchInput = ({ searchParamName, placeholder }: { searchParamName: string, placeholder: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchValueRef = useRef(searchParams.get(searchParamName) || '');
  const isUpdatingFromUrlRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync searchValueRef with URL when URL changes externally
  useEffect(() => {
    const paramValue = searchParams.get(searchParamName) || '';
    const currentValue = searchValueRef.current;
    
    // Only update if URL param changed externally (not from our update)
    if (!isUpdatingFromUrlRef.current && paramValue !== currentValue) {
      searchValueRef.current = paramValue;
      if (inputRef.current) {
        inputRef.current.value = paramValue;
      }
    }
    
    // Reset the flag after processing
    isUpdatingFromUrlRef.current = false;
  }, [searchParams, searchParamName]);

  // Debounce and update URL when input value changes
  const updateUrl = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const currentParamValue = searchParams.get(searchParamName) || '';
      const newValue = value.trim();

      // Only update URL if the value differs from current URL param
      if (newValue !== currentParamValue) {
        isUpdatingFromUrlRef.current = true;

        const newSearchParams = new URLSearchParams(searchParams);

        if (newValue) {
          newSearchParams.set(searchParamName, newValue);
        } else {
          newSearchParams.delete(searchParamName);
        }

        // Use replace to prevent focus loss and avoid adding to browser history
        setSearchParams(newSearchParams, { replace: true });

        // Restore focus to input after URL update
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }, 300);
  }, [searchParams, setSearchParams, searchParamName]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    searchValueRef.current = value;
    updateUrl(value);
  }, [updateUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Input.Root>
      <Input.Input
        ref={inputRef}
        id={searchParamName}
        name={searchParamName}
        type='text'
        placeholder={placeholder}
        className='py-3.5 pl-[52px]'
        defaultValue={searchParams.get(searchParamName) || ''}
        onChange={handleInputChange}
        autoComplete='off'
      />
      <Input.Icon as={Icons.search} className='[&_svg]:size-6' />
    </Input.Root>
  );
};

export default SearchInput;
