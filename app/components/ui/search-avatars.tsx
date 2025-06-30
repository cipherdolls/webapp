import React from 'react';
import type { JSX } from 'react';
import * as Input from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';
import { useState, useMemo } from 'react';
import type { User, Avatar } from '~/types';
import { useRouteLoaderData } from 'react-router';
import { Link } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import { PICTURE_SIZE } from '~/constants';

const SearchAvatars = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const me = useRouteLoaderData('routes/_main') as User;
  const avatars = useRouteLoaderData('routes/_main._general.avatars') as Avatar[];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsOpen(value.length > 0);
  };

  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return <>{text}</>;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <>
        {before && <span className='text-neutral-03'>{before}</span>}
        <span className='text-base-black'>{match}</span>
        {after && <span className='text-neutral-03'>{after}</span>}
      </>
    );
  };

  const filteredAvatars = useMemo(() => {
    if (!searchValue) return { myAvatars: [], publicAvatars: [] };

    const searchTerm = searchValue.toLowerCase();
    const filtered = avatars.filter(
      (avatar) => avatar.name.toLowerCase().includes(searchTerm) || avatar.shortDesc.toLowerCase().includes(searchTerm)
    );

    return {
      myAvatars: filtered.filter((avatar) => avatar.userId === me.id),
      publicAvatars: filtered.filter((avatar) => avatar.published && avatar.userId !== me.id),
    };
  }, [searchValue, avatars, me.id]);

  const hasMatchingItems = useMemo(() => {
    return filteredAvatars.myAvatars.length > 0 || filteredAvatars.publicAvatars.length > 0;
  }, [filteredAvatars]);

  return (
    <div className='flex flex-col relative mb-8'>
      <Input.Root>
        <Input.Input
          id='name'
          name='name'
          type='text'
          placeholder='Search your or public avatars'
          className='py-3.5 pl-[52px]'
          value={searchValue}
          onChange={handleInputChange}
          autoComplete='off'
        />
        <Input.Icon as={Icons.search} className='[&_svg]:size-6' />
      </Input.Root>
      <div
        className={`max-h-[400px] overflow-y-auto absolute top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-bottom-level-2 z-10 origin-top transition-all duration-200 ease-in-out ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        {searchValue && !hasMatchingItems && <div className='py-6 text-center text-sm text-slate-500'>No results found.</div>}
        {searchValue && hasMatchingItems && (
          <div className='pt-4 pb-2 px-2 flex flex-col gap-5'>
            <div className='flex flex-col gap-1'>
              <p className='text-label px-2 text-neutral-02'>My Avatars</p>
              <div className='flex flex-col'>
                {filteredAvatars.myAvatars.length > 0 ? (
                  filteredAvatars.myAvatars.map((avatar) => (
                    <AvatarItem key={avatar.id} avatar={avatar} searchTerm={searchValue} highlightMatch={highlightMatch} />
                  ))
                ) : (
                  <div className='p-2 text-label text-neutral-02'>Not found</div>
                )}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='text-label px-2 text-neutral-02'>Public Avatars</p>
              <div className='flex flex-col'>
                {filteredAvatars.publicAvatars.length > 0 ? (
                  filteredAvatars.publicAvatars.map((avatar) => (
                    <AvatarItem key={avatar.id} avatar={avatar} searchTerm={searchValue} highlightMatch={highlightMatch} />
                  ))
                ) : (
                  <div className='p-2 text-label text-neutral-02'>Not found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAvatars;

interface AvatarItemProps {
  avatar: Avatar;
  searchTerm: string;
  highlightMatch: (text: string, query: string) => JSX.Element;
}

const AvatarItem = ({ avatar, searchTerm, highlightMatch }: AvatarItemProps) => {
  return (
    <Link to={`/avatars/${avatar.id}`} className='block'>
      <div className='py-2 px-3 flex items-center gap-2 hover:bg-gray-200 transition-all duration-200 rounded-xl'>
        <img
          src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
          srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
          alt={avatar.name}
          className='size-10 rounded-full object-cover'
        />
        <div className='flex flex-col gap-1'>
          <p className='text-body-md font-semibold'>{highlightMatch(avatar.name, searchTerm)}</p>
          <span className='text-label font-semibold text-neutral-02'>{avatar.gender}</span>
        </div>
      </div>
    </Link>
  );
};
