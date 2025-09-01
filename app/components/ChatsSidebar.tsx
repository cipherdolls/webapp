import { NavLink, useParams } from 'react-router';
import type { Avatar, Chat, meta, GroupedChatsByAvatar } from '~/types';
import { cn } from '~/utils/cn';
import { Icons } from './ui/icons';
import AvatarCard from './AvatarCardReusable';
import * as Button from './ui/button/button';
import AvatarSelectModal from './AvatarSelectModal';
import AvatarScenarioModal from './AvatarScenarioModal';
import React, { useState, useMemo, useEffect } from 'react';
import { ROUTES } from '~/constants';

interface ChatsSidebarProps {
  chats: Chat[];
  avatars: Avatar[] | { data: Avatar[]; meta: meta };
  isChatsLoading: boolean
}

function SidebarSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-2 w-full px-2 md:w-[348px]'>
      <div className='px-3 py-[18px] flex items-center justify-between'>
        <h3 className='text-heading-h3'>Chats</h3>

        <div className='w-10 h-10 rounded-full bg-neutral-04 animate-pulse' />
      </div>

      {new Array(count).fill(null).map((_, index) => (
        <div className='min-h-20 flex items-center justify-between rounded-xl w-full p-3 bg-neutral-05 animate-pulse'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full bg-neutral-04' />
            <div className='w-32 h-4 rounded-[10px] bg-neutral-04' />
          </div>

          <div className='w-5 h-5 rounded-full bg-neutral-04 mr-2' />
        </div>
      ))}
    </div>
  );
}

const ChatsSidebar = ({ chats, avatars, isChatsLoading }: ChatsSidebarProps) => {
  const avatarsList = Array.isArray(avatars) ? avatars : avatars.data;
  const params = useParams();

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

  const [expandedAvatars, setExpandedAvatars] = useState<Set<string>>(new Set());
  useEffect(() => {
    const chatId = params.chatId;
    if (chatId) {
      const currentChat = chats.find((chat) => chat.id === chatId);
      if (currentChat) {
        setExpandedAvatars((prev) => {
          const newSet = new Set(prev);
          newSet.add(currentChat.avatar.id);
          return newSet;
        });
      }
    }
  }, [params.chatId, chats]);

  const showChatsButton = avatarsList.some((avatar) => !groupedChats.find((group) => group.avatar.id === avatar.id));

  const handleAvatarClick = (avatarId: string) => {
    setExpandedAvatars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(avatarId)) {
        newSet.delete(avatarId);
      } else {
        newSet.add(avatarId);
      }
      return newSet;
    });
  };

  return (
    <div
      className={cn('pb-3 px-2 md:pb-0 md:px-0 h-full shrink-0 flex flex-col w-full', chats.length !== 0 && 'md:w-[348px]')}
    >
      {isChatsLoading ? <SidebarSkeleton /> : (
        <>
          {chats.length !== 0 && (
            <div className='px-5 py-[18px] flex items-center justify-between'>
              <h3 className='text-heading-h3'>Chats</h3>
              {showChatsButton && (
                <AvatarSelectModal avatars={avatarsList}>
                  <Button.Root size='icon' aria-label='New Chat' className='shrink-0'>
                    <Button.Icon as={Icons.chat} />
                  </Button.Root>
                </AvatarSelectModal>
              )}
            </div>
          )}

          <div className='flex-1 sm:px-2 scrollbar-medium overflow-auto bg-gradient-1 rounded-xl sm:bg-none sm:rounded-none'>
            <div className='flex flex-col select-none'>
              {groupedChats.map((group) => (
                <div key={group.avatar.id} className='mb-2'>
                  <div
                    className='flex items-center gap-3 cursor-pointer hover:bg-neutral-05 rounded-xl mb-2'
                    onClick={() => handleAvatarClick(group.avatar.id)}
                  >
                    <AvatarCard avatar={group.avatar} className='flex items-center gap-3 flex-1 select-none'>
                      <AvatarCard.Avatar className='size-8' />
                      <AvatarCard.Content className='flex-1'>
                        <AvatarCard.Name className='text-body-sm font-semibold' />
                      </AvatarCard.Content>
                    </AvatarCard>
                    <div className='flex items-center gap-2 pr-2'>
                      {group.chats.length > 1 && (
                        <span className='text-xs text-neutral-01 bg-neutral-04 px-2 py-1 rounded-full'>{group.chats.length}</span>
                      )}
                      {group.chats.length > 1 && (
                        <Icons.chevronDown
                          className={cn('size-4 text-neutral-01 transition-transform', {
                            'rotate-180': expandedAvatars.has(group.avatar.id),
                          })}
                        />
                      )}
                    </div>
                  </div>

                  {expandedAvatars.has(group.avatar.id) && (
                    <div className='ml-4 space-y-1 border-l border-neutral-04 pl-3 animate-chat-toggle'>
                      {group.chats.map((chat) => (
                        <NavLink
                          key={chat.id}
                          to={`${ROUTES.chats}/${chat.id}`}
                          className={({ isActive }) =>
                            cn('block rounded-lg p-3 group transition-colors', {
                              'bg-white sm:bg-neutral-05 border border-neutral-04': isActive,
                              'hover:bg-neutral-04': !isActive,
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
                        <AvatarScenarioModal avatar={group.avatar}>
                          <button className='w-full p-3 rounded-lg border-2 border-dashed border-neutral-04 hover:border-neutral-02 hover:bg-neutral-05 transition-colors text-center'>
                            <div className='flex items-center justify-center gap-2 text-neutral-01 hover:text-base-black transition-colors'>
                              <Icons.chat className='size-4' />
                              <span className='text-body-sm font-medium'>New chat</span>
                            </div>
                          </button>
                        </AvatarScenarioModal>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatsSidebar;
