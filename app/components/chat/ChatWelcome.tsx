import { Form } from 'react-router';
import AvatarPicture from '~/components/AvatarPicture';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';
import type { Avatar, Chat } from '~/types';
import AvatarSelectModal from '../AvatarSelectModal';

type ChatStateVariants = 'hasChats' | 'noChatsNoAvatars' | 'noChatsHasAvatars';

type ChatStateConfig = {
  header?: string | React.ReactNode;
  title: string | React.ReactNode;
  footer?: React.ReactNode;
};

interface ChatWelcomeProps {
  chats: Chat[];
  avatars: Avatar[];
}

const CHATS_STATE_CONFIGS: Record<ChatStateVariants, (avatars: Avatar[], chats?: Chat[]) => ChatStateConfig> = {
  // user already has existing chat sessions
  hasChats: (_avatars, _chats) => ({
    header: '👈',
    title: 'Choose a message to open it',
  }),
  // user has no chat sessions and no avatars
  noChatsNoAvatars: (_avatars, _chats) => ({
    header: '💬',
    title: 'You Have No Avatar to Chat',
  }),
  // user has no chat sessions but has avatars
  noChatsHasAvatars: (avatars: Avatar[], chats?: Chat[]) => ({
    header: (
      <>
        {avatars.slice(0, 3).map((avatar, index) => (
          <AvatarPicture
            key={avatar.id}
            avatar={avatar}
            className={cn('shrink-0 relative rounded-full border-2 border-base-white', {
              'size-14 sm:size-20 z-30 order-2': index === 0,
              'size-10 sm:size-16 -ml-4 z-20 order-3': index === 1,
              'size-10 sm:size-16 -mr-4 z-10 order-1 ': index === 2,
            })}
          />
        ))}
      </>
    ),
    title: `You Have ${avatars.length > 1 ? `${avatars.length} Avatars` : 'an Avatar'} to Chat`,
    footer: (
      <>
        {avatars.length > 1 ? (
          <AvatarSelectModal avatars={avatars}>
            <Button.Root className='px-5'>Choose an Avatar</Button.Root>
          </AvatarSelectModal>
        ) : (
          <Form method='POST' action='/chats'>
            <input hidden name='avatarId' id='avatarId' value={avatars[0].id} readOnly />
            {avatars[0].scenarios?.[0]?.id && (
              <input hidden name='scenarioId' id='scenarioId' value={avatars[0].scenarios?.[0]?.id} readOnly />
            )}
            <Button.Root className='px-5 sm:h-12' type='submit' size='sm'>
              Chat with Avatar
            </Button.Root>
          </Form>
        )}
      </>
    ),
  }),
} as const;

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ chats, avatars }) => {
  const hasChats = chats.length > 0;
  const hasAvatars = avatars.length > 0;

  const variant: ChatStateVariants = hasChats ? 'hasChats' : hasAvatars ? 'noChatsHasAvatars' : 'noChatsNoAvatars';

  const { header, title, footer } = CHATS_STATE_CONFIGS[variant](avatars, chats);

  return (
    <div
      className={cn(
        'lex-1 size-full flex flex-col items-center justify-center text-center pb-24',
        hasChats && 'border-l border-neutral-04'
      )}
    >
      {header && <div className='text-heading-h2 md:text-heading-h1 flex items-center justify-center mb-5 md:mb-8'>{header}</div>}
      <h3 className='text-body-lg md:text-heading-h3 font-semibold'>{title}</h3>
      {footer && <div className='mt-4 sm:mt-6'>{footer}</div>}
    </div>
  );
};

export default ChatWelcome;
