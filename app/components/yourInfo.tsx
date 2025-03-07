import { Link } from 'react-router';
import { Card } from '~/components/card';
import { cn } from '~/utils/cn';
import type { Avatar, User } from '~/types';
import AddYourInfoModal from './addYourInfoModal';

const YourInfo = ({
  info,
  me,
  userInfo,
  setUserInfo,
}: {
  info: Avatar[];
  me: User;
  userInfo: { name: string; publicName: string; character: string };
  setUserInfo: (info: { name: string; publicName: string; character: string }) => void;
}) => {
  const hasUserInfo = userInfo.name || userInfo.publicName || userInfo.character;

  return (
    <Card.Root className='sm:pr-4'>
      <Card.Label>Your Info</Card.Label>
      <Card.Main className='max-h-max'>
        <Card.Header>
          <Link to='/account'>
            <Card.HeaderSection>
              <AddYourInfoModal userInfo={userInfo} setUserInfo={setUserInfo} />
            </Card.HeaderSection>
          </Link>
        </Card.Header>
        <Card.Content className={cn(hasUserInfo && 'border-t-0')}>
          {!hasUserInfo ? (
            <div className='sm:pb-14'>
              <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                <h1 className='sm:text-heading-h1 text-heading-h2'>🤔</h1>
                <div className='flex flex-col sm:gap-2 gap-1'>
                  <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>Who are You?</h4>
                  <p className='text-body-md text-neutral-01 sm:text-center'>Add some info to make conversations more personalized</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col bg-base-white shadow-regular rounded-xl sm:p-5 p-3 divide-y divide-neutral-04 max-h-[350px] sm:max-h-[500px] overflow-y-auto scrollbar-medium'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  {userInfo.name && <h4 className='text-heading-h4 font-semibold text-base-black'>{userInfo.name}</h4>}
                  {userInfo.publicName && <h4 className='text-body-md text-neutral-01'>👥 {userInfo.name}</h4>}
                </div>
                {userInfo.character && <p className='text-body-md text-base-black'>{userInfo.character}</p>}
              </div>
            </div>
          )}
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};

export default YourInfo;
