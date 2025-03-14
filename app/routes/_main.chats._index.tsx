import ChatWelcome from '~/components/chat/ChatWelcome';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main.chats._index';

export async function clientLoader() {
  const [chats, avatars] = await Promise.all([
    fetchWithAuth('chats').then((res) => res.json()),
    fetchWithAuth('avatars').then((res) => res.json()),
  ]);

  return { chats, avatars };
}

export default function ChatsIndex({ loaderData }: Route.ComponentProps) {
  const { chats, avatars } = loaderData;

  return <ChatWelcome chats={chats} avatars={avatars} />;
}
