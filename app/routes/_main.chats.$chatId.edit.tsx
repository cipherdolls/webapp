import { Link, useNavigate } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useAlert } from '~/providers/AlertDialogProvider';
import ScenarioToggle from '~/components/ScenarioToggle';
import { Card } from '~/components/card';
import { useState } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import type { Chat } from '~/types';
import ChatDestroy from '~/routes/chats.$id.destroy';
import ChatDeleteButton from '~/components/buttons/ChatDeleteButton';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat edit' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { chatId } = params;
  const res = await fetchWithAuth(`chats/${chatId}`);
  return await res.json();
}

export default function ChatEdit({ loaderData }: Route.ComponentProps) {
  const chat = loaderData;
  const navigate = useNavigate();
  const alert = useAlert();

  const handleMessageClose = () => {
    navigate(`/chats/${chat.id}`);
  };


  const handleScenarioInfoClick = () => {
    alert({
      icon: '🎭',
      title: 'Scenarios',
      body: (
        <>
          💅🏻 Easy Talk - focused on casual topics with cheerful, warm, and concise responses.
          <br />
          <br />
          🧐 Deep Talk - focused on meaningful topics, fostering connection through introspection and insightful exchanges.
          <br />
          <br />
          🔥 Sexy Talk - focused on building rapport with compliments, innuendos and flirting.
        </>
      ),
    });
  };

  return (
    <>
      <div className='pageModal'>
        <div className='pageModal-overlay' onClick={handleMessageClose}></div>
        <div className='pageModal-content'>
          <Button.Root size='icon' variant='white' className='pageModal-button-close' onClick={handleMessageClose}>
            <Button.Icon as={Icons.close} />
          </Button.Root>
          {/* page modal header */}
          <div className='pageModal-header'>
            <button onClick={handleMessageClose} className='md:hidden'>
              <Icons.chevronLeft />
            </button>
            <div className='flex items-center gap-3'>
              <h3 className='text-heading-h3 text-base-black'>Freya</h3>
              <span className='text-body-lg text-neutral-01'>•</span>
              <p className='text-body-lg text-neutral-01'>{chat.avatar.shortDesc}</p>
            </div>
          </div>
          <div className='flex flex-col flex-1 gap-8 overflow-y-auto scrollbar-medium pb-5 -mx-5 px-5'>
            {/* Avatar link */}
            <Link
              to={`/avatars/${chat.avatar.id}`}
              className='flex-shrink-0 flex flex-col backdrop-blur-48 bg-gradient-1 rounded-xl overflow-hidden'
            >
              <div className='w-full h-[263px] flex items-center justify-center rounded-xl bg-neutral-04'>
                {chat.avatar.picture ? (
                  <img
                    src={getPicture(chat.avatar, 'avatars', false)}
                    srcSet={getPicture(chat.avatar, 'avatars', true)}
                    alt={chat.avatar.name}
                    className='size-full object-cover rounded-lg'
                  />
                ) : (
                  <Icons.fileUploadIcon />
                )}
              </div>
              <p className='w-full flex justify-center items-center gap-2 text-body-sm text-base-black font-semibold py-4'>
                Go to Avatar Page <Icons.chevronRight />
              </p>
            </Link>

            {/* scenario toggle  */}
            <Card.Root>
              <div className='flex items-center justify-between'>
                <Card.Label className='sm:text-heading-h4'>Scenarios</Card.Label>
                <button onClick={handleScenarioInfoClick}>
                  <Icons.information />
                </button>
              </div>

              <Card.Main>
                <ScenarioToggle chat={chat} className='!bg-transparent !backdrop-blur-none w-full' />
              </Card.Main>
            </Card.Root>

            {/* Silent mode */}
            <SilentModeToggleCard />

            {/* Doll */}
            <DollCard chat={chat} />

            <div className='pt-10 mt-auto'>
              <ChatDeleteButton chatId={chat.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// TODO: update silent mode toggle using DB and move from here
const SilentModeToggleCard = () => {
  const [isActive, setIsActive] = useState(false);
  return (
    <Card.Root>
      <Card.Label className='sm:text-heading-h4'>Silent Mode</Card.Label>
      <Card.Main>
        <button
          className={cn('flex flex-row items-center gap-6 p-6 rounded-xl', {
            'shadow-regular bg-white': isActive,
          })}
          onClick={() => setIsActive((prev) => !prev)}
        >
          <div className='text-4xl'> {isActive ? '🤫' : '📣'}</div>
          <div className='flex flex-col gap-1 text-left'>
            <p className='text-body-lg font-semibold text-base-black'>Silent Mode is {isActive ? 'On' : 'Off'}</p>
            <p className='text-body-md text-neutral-01'>An avatar will {isActive && 'not'} speak</p>
          </div>
          <div
            className={cn('w-[40px] h-[24px] rounded-full bg-neutral-04 relative ml-auto', {
              '!bg-base-black': isActive,
            })}
          >
            <span
              className={cn(
                'absolute top-1 left-1 w-[16px] h-[16px] rounded-full bg-base-white shadow-regular transition-all duration-100',
                {
                  'translate-x-full': isActive,
                }
              )}
            ></span>
          </div>
        </button>
      </Card.Main>
    </Card.Root>
  );
};

// TODO: move from here when will be able to add a doll
const DollCard = ({ chat }: { chat: Chat }) => {
  const alert = useAlert();
  return (
    <Card.Root>
      <div className='flex items-center justify-between'>
        <Card.Label className='sm:text-heading-h4'>Doll</Card.Label>
      </div>
      <Card.Main>
        <div className={cn('flex flex-row items-center gap-6 p-6 rounded-xl')}>
          <div className='text-4xl'>🤷‍♀️</div>
          <div className='flex flex-col flex-start gap-1 text-left'>
            <p className='text-body-lg font-semibold text-base-black'>You Have No Dolls Yet</p>
            <button
              className='text-body-md text-neutral-01 text-left underline'
              onClick={() =>
                alert({
                  icon: '👩 📱',
                  title: 'How to Add a Doll',
                  body: 'To add a doll, you need to create an avatar first. Then, you can add a doll to your chat by selecting the avatar from the avatar list.',
                })
              }
            >
              How to Add a Doll
            </button>
          </div>
        </div>
      </Card.Main>
    </Card.Root>
  );
};
