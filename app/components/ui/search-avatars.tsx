import React from 'react';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';
import { useSearchParams } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import { useDebounceValue } from 'usehooks-ts';

const SearchAvatars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('name') || '');
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);

  useEffect(() => {
    setSearchValue(searchParams.get('name') || '');
  }, [searchParams]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (debouncedSearchValue.trim()) {
      newSearchParams.set('name', debouncedSearchValue.trim());
    } else {
      newSearchParams.delete('name');
    }
    
    setSearchParams(newSearchParams);
  }, [debouncedSearchValue, searchParams, setSearchParams]);

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
