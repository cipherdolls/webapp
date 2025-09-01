import { Form, Link } from 'react-router';
import { PICTURE_SIZE, ROUTES } from '~/constants';
import type { Avatar } from '~/types';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';

export const AvatarCard = ({ avatar }: { avatar: Avatar }) => {
  const { name, shortDesc, id, chats } = avatar;

  return (
    <div className='lg:p-4 sm:p-3.5 p-3 flex items-center justify-between gap-4 sm:gap-4.5 flex-wrap'>
      <div className='sm:gap-4.5 gap-4 flex items-center'>
        <div className='shrink-0'>
          <Link to={`${ROUTES.avatars}/${id}`} >
            <img
              src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
              srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
              alt={name}
              className='lg:size-20 sm:size-16 size-14 rounded-full'
            />
          </Link>
        </div>
        <div className='flex flex-1 gap-0.5 flex-col'>
          <h4 className='text-base-black sm:text-heading-h4 text-body-lg font-semibold'>{name}</h4>
          <p className='sm:text-body-md text-body-sm text-neutral-01'>{shortDesc}</p>
        </div>
      </div>

      {(chats?.length || 0) > 0 ? (
        <Link to={`${ROUTES.chats}/${avatar.chats?.[0]?.id}`}>
          <Button.Root size='sm' className='px-5'>
            Continue Chats
          </Button.Root>
        </Link>
      ) : (
        <Form method='POST' action='/chats' >
          <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
          <Button.Root type='submit' size='sm' className='px-5'>
            Start Chat
          </Button.Root>
        </Form>
      )}


    </div>
  );
};
