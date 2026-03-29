import React, { useState, useMemo } from 'react';
import type { Chat, GroupedChatsByAvatar } from '~/types';
import { cn } from '~/utils/cn';
import { Link, NavLink } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import AvatarCard from '~/components/AvatarCardReusable';
import ChatSelectionWizard from '~/components/ChatSelectionWizard';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { ANIMATE_CHAT_ITEMS, ANIMATE_DURATION, ROUTES, TOKEN_BALANCE } from '~/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from 'usehooks-ts';
import { useAuthStore } from '~/store/useAuthStore';

function YourChatsSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='rounded-[10px] h-6 bg-neutral-04 w-full animate-pulse max-w-[110px]'></div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <div className='rounded-[10px] h-20 bg-neutral-04 w-full animate-pulse'></div>
        <div className='rounded-[10px] h-20 bg-neutral-04 w-full animate-pulse'></div>
        <div className='rounded-[10px] h-20 bg-neutral-04 w-full animate-pulse'></div>
        <div className='rounded-[10px] h-20 bg-neutral-04 w-full animate-pulse'></div>
      </div>
      <div className='rounded-full h-10 bg-neutral-04 w-full animate-pulse max-w-[118px] mx-auto -mt-2'></div>
    </div>
  );
}

interface ChatItemProps {
  group: GroupedChatsByAvatar;
  expandedAvatar: string | undefined;
  handleAvatarClick: (avatarId: string) => void;
  hasMinimumTokens: boolean;
}

const YourChats = () => {
  const [showAll, setShowAll] = useState(false);
  const [expandedAvatar, setExpandedAvatar] = useState<string>();

  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const { data: avatarsData, isLoading: avatarsLoading } = useAvatars();
  const { data: user } = useUser();
  const { isUsingBurnerWallet } = useAuthStore();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const hasMinimumTokens = isUsingBurnerWallet || (user?.tokenSpendable || 0) >= TOKEN_BALANCE.MINIMUM_SPENDABLE;

  const chats = chatsData || [];
  const avatars = avatarsData || [];
  const avatarsList = Array.isArray(avatars) ? avatars : avatars.data;

  const defaultChatHeight = 88;
  const initChatsContainerHeight = chats.length <= 2 ? defaultChatHeight : defaultChatHeight * 2;

  const groupedChats: GroupedChatsByAvatar[] = useMemo(() => {
    const avatarChatMap = new Map<string, Chat[]>();

    chats.forEach((chat) => {
      const avatarId = chat.avatar.id;
      if (!avatarChatMap.has(avatarId)) {
        avatarChatMap.set(avatarId, []);
      }
      avatarChatMap.get(avatarId)!.push(chat);
    });

    return Array.from(avatarChatMap.entries())
      .map(([avatarId, avatarChats]) => {
        const avatar = avatarsList.find((avatar) => avatar.id === avatarId) || chats.find((chat) => chat.avatar.id === avatarId)?.avatar!;
        const sortedChats = avatarChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return { avatar, chats: sortedChats };
      })
      .sort((a, b) => {
        const aLatest = Math.max(...a.chats.map((chat) => new Date(chat.updatedAt).getTime()));
        const bLatest = Math.max(...b.chats.map((chat) => new Date(chat.updatedAt).getTime()));
        return bLatest - aLatest;
      });
  }, [chats, avatarsList]);

  if (chatsLoading || avatarsLoading) {
    return <YourChatsSkeleton />;
  }

  const leftChatGroup = groupedChats.slice(0, groupedChats.length / 2);
  const rightChatGroup = groupedChats.slice(groupedChats.length / 2);

  const handleShowAll = () => {
    setExpandedAvatar('');
    setShowAll(!showAll);
  };

  const handleAvatarClick = (avatarId: string) => {
    if (expandedAvatar === avatarId) return setExpandedAvatar('');

    setShowAll(true);
    setExpandedAvatar(avatarId);
  };

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Chats</h3>

      <motion.div
        initial={false}
        animate={{ height: 'auto' }}
        transition={ANIMATE_DURATION}
        className='grid grid-cols-1 md:grid-cols-2 gap-2 bg-gradient-1 rounded-xl overflow-y-hidden p-2 pt-2'
      >
        {groupedChats.length > 0 ? (
          isMobile || groupedChats.length <= 2 ? (
            <>
              {groupedChats.map((group, index) => (
                <div className={cn('overflow-y-hidden', !showAll && index >= 4 && 'hidden')} key={index}>
                  <ChatItem
                    group={group}
                    expandedAvatar={expandedAvatar}
                    handleAvatarClick={handleAvatarClick}
                    hasMinimumTokens={hasMinimumTokens}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <motion.div
                initial={false}
                animate={{ height: !showAll ? initChatsContainerHeight : 'auto' }}
                transition={ANIMATE_DURATION}
                className='flex flex-col overflow-y-hidden -mt-2'
              >
                {leftChatGroup.map((group, index) => (
                  <div className='pt-2' key={index}>
                    <ChatItem
                      group={group}
                      expandedAvatar={expandedAvatar}
                      handleAvatarClick={handleAvatarClick}
                      hasMinimumTokens={hasMinimumTokens}
                    />
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={false}
                animate={{ height: !showAll ? initChatsContainerHeight : 'auto' }}
                transition={ANIMATE_DURATION}
                className='flex flex-col overflow-y-hidden -mt-2'
              >
                {rightChatGroup.map((group, index) => (
                  <div className='pt-2' key={index}>
                    <ChatItem
                      group={group}
                      expandedAvatar={expandedAvatar}
                      handleAvatarClick={handleAvatarClick}
                      hasMinimumTokens={hasMinimumTokens}
                    />
                  </div>
                ))}
              </motion.div>
            </>
          )
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>💬</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Chats Yet</h4>
              <Link
                to={ROUTES.chats}
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Start new chat
              </Link>
            </div>
          </div>
        )}
      </motion.div>

      {groupedChats.length > 4 && (
        <div className='mx-auto -mt-2'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default YourChats;

const ChatItem = ({ group, expandedAvatar, handleAvatarClick, hasMinimumTokens }: ChatItemProps) => {
  return (
    <>
      <div
        className='relative z-20 flex items-center gap-3 rounded-xl select-none cursor-pointer bg-base-white transition-colors duration-300 overflow-hidden hover:bg-white/80'
        onClick={() => handleAvatarClick(group.avatar.id)}
      >
        <AvatarCard avatar={group.avatar} className='flex items-center gap-3 flex-1 select-none'>
          <AvatarCard.Avatar className='size-8' />
          <AvatarCard.Content className='flex-1'>
            <AvatarCard.Name className='text-body-sm font-semibold' />
          </AvatarCard.Content>
        </AvatarCard>

        <div className='flex items-center gap-2 pr-2'>
          {group.chats.length > 0 && (
            <span className='text-xs text-neutral-01 bg-neutral-04 px-2 py-1 rounded-full'>{group.chats.length}</span>
          )}
          {group.chats.length > 0 && (
            <Icons.chevronDown
              className={cn('size-4 text-neutral-01 transition-transform', {
                'rotate-180': expandedAvatar === group.avatar.id,
              })}
            />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expandedAvatar === group.avatar.id && (
          <motion.div
            initial={ANIMATE_CHAT_ITEMS.initial}
            animate={ANIMATE_CHAT_ITEMS.animate}
            exit={ANIMATE_CHAT_ITEMS.exit}
            transition={ANIMATE_CHAT_ITEMS.transition}
            className={cn('relative z-10 ml-4 space-y-1 border-l border-neutral-04 pl-3 pt-2 animate-chat-toggle')}
          >
            {group.chats.map((chat) => (
              <NavLink
                key={chat.id}
                to={`${ROUTES.chats}/${chat.id}`}
                className={({ isActive }) =>
                  cn('block rounded-lg p-3 group transition-colors', {
                    'bg-white sm:bg-neutral-05 border border-neutral-04': isActive,
                    'hover:bg-white/80 ': !isActive,
                  })
                }
              >
                <div className='flex items-center gap-3'>
                  <span className='text-body-sm font-medium truncate'>{chat.scenario.name}</span>
                </div>
                <div className='text-xs text-neutral-01 mt-1 truncate'>{new Date(chat.updatedAt).toLocaleString()}</div>
              </NavLink>
            ))}

            <div className='pt-2'>
              <ChatSelectionWizard mode='avatar-to-scenario' avatar={group.avatar}>
                <button
                  className='w-full p-3 rounded-lg border-2 border-dashed border-neutral-04 hover:border-neutral-02 hover:bg-neutral-05 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!hasMinimumTokens}
                >
                  <div className='flex items-center justify-center gap-2 text-neutral-01 hover:text-base-black transition-colors'>
                    <Icons.chat className='size-4' />
                    <span className='text-body-sm font-medium'>New chat</span>
                  </div>
                </button>
              </ChatSelectionWizard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
