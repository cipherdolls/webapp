import React from 'react';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';
import { useSearchParams, useNavigate } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import { useDebounceValue } from 'usehooks-ts';

const SearchAvatars = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(searchParams.get('name') || '');
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);

  // Update local state when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get('name') || '');
  }, [searchParams]);

  // Update URL when debounced value changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (debouncedSearchValue.trim()) {
      newSearchParams.set('name', debouncedSearchValue.trim());
    } else {
      newSearchParams.delete('name');
    }
    
    // Only navigate if the debounced value is different from current URL param
    const currentName = searchParams.get('name') || '';
    if (debouncedSearchValue.trim() !== currentName) {
      navigate(`/avatars?${newSearchParams.toString()}`);
    }
  }, [debouncedSearchValue, searchParams, navigate]);

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
        placeholder='Search avatars by name'
        className='py-3.5 pl-[52px]'
        value={searchValue}
        onChange={handleInputChange}
        autoComplete='off'
      />
      <Input.Icon as={Icons.search} className='[&_svg]:size-6' />
    </Input.Root>
  );
};

export default SearchAvatars;
