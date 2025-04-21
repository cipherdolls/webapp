import ChatWelcome from '~/components/chat/ChatWelcome';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main.chats._index';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export async function clientLoader() {
  const [chats, avatars] = await Promise.all([
    fetchWithAuth('chats').then((res) => res.json()),
    fetchWithAuth('avatars').then((res) => res.json()),
  ]);

  return { chats, avatars };
}

export default function ChatsIndex({ loaderData }: Route.ComponentProps) {
  const { chats, avatars } = loaderData;
  const isDesktopView = useMediaQuery('(min-width: 1024px)');
  const navigate = useNavigate();

  useEffect(() => {
    if (chats.length > 0 && isDesktopView) {
      const firstChat = chats[0];
      navigate(`/chats/${firstChat.id}`);
    }
  }, [chats, isDesktopView, navigate]);

  return <ChatWelcome chats={chats} avatars={avatars} />;
}
