import React from 'react';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';
import { useSearchParams, useNavigate } from 'react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ROUTES } from '~/constants';

const SearchAiProviders = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(searchParams.get('name') || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when URL changes
  useEffect(() => {
    const urlValue = searchParams.get('name') || '';
    setSearchValue(urlValue);
  }, [searchParams]);

  // Handle search with proper debounce
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const currentName = searchParams.get('name') || '';
      const trimmedValue = searchValue.trim();
      
      // Only navigate if the search value is different from current URL param
      if (trimmedValue !== currentName) {
        const newSearchParams = new URLSearchParams(searchParams);
        if (trimmedValue) {
          newSearchParams.set('name', trimmedValue);
        } else {
          newSearchParams.delete('name');
        }
        
        navigate(`${ROUTES.services}/ai?${newSearchParams.toString()}`);
      }
    }, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue, searchParams, navigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  }, []);

  return (
    <Input.Root>
      <Input.Input
        id='name'
        name='name'
        type='text'
        placeholder='Search AI providers by name'
        className='py-3.5 pl-[52px]'
        value={searchValue}
        onChange={handleInputChange}
        autoComplete='off'
      />
      <Input.Icon as={Icons.search} className='[&_svg]:size-6' />
    </Input.Root>
  );
};

export default SearchAiProviders;