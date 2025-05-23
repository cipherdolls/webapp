import { Link } from 'react-router';
import { Card } from '~/components/card';
import { Icons } from '~/components/ui/icons';
import { AvatarCard } from './avatarCard';
import { cn } from '~/utils/cn';
import type { Avatar } from '~/types';

const YourAvatars = ({ avatars }: { avatars: Avatar[] }) => {
  return (
    <Card.Root className='sm:pr-4'>
      <Card.Label>Your Avatars</Card.Label>
      <Card.Main className='max-h-max'>
        <Card.Header>
          <Link to='/community/avatars'>
            <Card.HeaderSection>
              <Icons.add />
              Add Avatar
            </Card.HeaderSection>
          </Link>
          <Link to='/avatars/new'>
            <Card.HeaderSection>
              <Icons.pen />
              Create Avatar
            </Card.HeaderSection>
          </Link>
        </Card.Header>
        <Card.Content className={cn(avatars.length > 0 && 'border-t-0')}>
          {avatars.length === 0 ? (
            <div className='sm:pb-14'>
              <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                <h1 className='sm:text-heading-h1 text-heading-h2'>🎨</h1>
                <div className='flex flex-col sm:gap-2 gap-1'>
                  <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
                  <p className='text-body-md text-neutral-01 sm:text-center'>You can add public avatar, or create a brand new own</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col bg-base-white shadow-regular rounded-xl sm:p-2 divide-y divide-neutral-04 max-h-[350px] sm:max-h-[500px] overflow-y-auto scrollbar-medium'>
              {avatars.map((avatar) => (
                <AvatarCard key={avatar.id} avatar={avatar} />
              ))}
            </div>
          )}
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};

export default YourAvatars;
