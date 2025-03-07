import React, { useState } from 'react';
import { cn } from '~/utils/cn';
import { Icons } from './ui/icons';
import UserTypeModal from './userTypeModal';

type UserType = 'consumer' | 'producer';

const UserType = () => {
  const [userType, setUserType] = useState<UserType>('producer');

  return (
    <div className='flex flex-col gap-4 sm:gap-5'>
      <div className='flex items-center justify-between'>
        <h3 className='sm:text-heading-h3 text-heading-h4 text-base-black'>User Info</h3>
        <UserTypeModal />
      </div>
      <div className='p-1 bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] grid grid-cols-2 rounded-[10px]'>
        <button
          type='button'
          className={cn(
            'flex items-center justify-center py-3 text-body-sm font-semibold rounded-[10px] transition-colors',
            userType === 'consumer' ? 'bg-white' : 'bg-transparent'
          )}
          onClick={() => setUserType('consumer')}
        >
          👌 Consumer
        </button>

        <button
          type='button'
          className={cn(
            'flex items-center justify-center py-3 text-body-sm font-semibold rounded-[10px] transition-colors',
            userType === 'producer' ? 'bg-white' : 'bg-transparent'
          )}
          onClick={() => setUserType('producer')}
        >
          😎 Producer
        </button>
      </div>
    </div>
  );
};

export default UserType;
