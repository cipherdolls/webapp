import ChatWelcome from '~/components/chat/ChatWelcome';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main.chats._index';
import { redirect } from 'react-router';

export async function clientLoader() {
  const [chats, avatars] = await Promise.all([
    fetchWithAuth('chats').then((res) => res.json()),
    fetchWithAuth('avatars').then((res) => res.json()),
  ]);

  if (chats.length > 0) {
    return redirect(`/chats/${chats[0].id}`);
  }

  return { chats, avatars };
}

export default function ChatsIndex({ loaderData }: Route.ComponentProps) {
  const { chats, avatars } = loaderData;

  return <ChatWelcome chats={chats} avatars={avatars} />;
}
