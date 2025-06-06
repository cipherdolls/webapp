import type { Avatar, Chat } from '~/types';
import type { Route } from './+types/_main.chats.$chatId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { Navigate, redirect, useNavigationType } from 'react-router';
import TalkMode from '~/components/chat/TalkMode';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params, request }: Route.LoaderArgs) {
  const { chatId } = params;
  const chatRes = await fetchWithAuth(`chats/${chatId}`);
  if (!chatRes.ok) {
    throw new Error('Failed to fetch chat');
  }
  const chat: Chat = await chatRes.json();

  // fetch avatar
  const avatarRes = await fetchWithAuth(`avatars/${chat.avatar.id}`);
  if (!avatarRes.ok) {
    throw new Error('Failed to fetch avatar');
  }
  const avatar: Avatar = await avatarRes.json();

  return { chat, avatar };
}

export default function TalkModeView({ loaderData }: Route.ComponentProps) {
  const { chat, avatar } = loaderData;
  const navigationType = useNavigationType();

  if (navigationType === 'POP') {
    return <Navigate to={`/chats/${chat.id}`} replace />;
  }


  
  return (
    <div
      className='fixed inset-0 lg:static flex-1 flex flex-col overflow-hidden md:rounded-xl max-lg:bg-gradient-talkMode '
    >
      <TalkMode chat={chat} avatar={avatar} />
    </div>
  );
}
