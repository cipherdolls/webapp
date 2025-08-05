import { useState, useRef } from 'react';
import type { Message } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

const useChat = (chatId: string, { limit = 20 }: { limit?: number } = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);

  const loadMessages = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`messages?chatId=${chatId}&limit=${limit}&direction=next&order=desc`);

      if (response.ok) {
        const data = await response.json();
        const messages = data.data.reverse() || [];
        cursorRef.current = data.meta?.nextCursor;
        setMessages(messages);
        setHasMore(data.meta?.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`messages?chatId=${chatId}&cursor=${cursorRef.current}&limit=${limit}&direction=next&order=desc`);
      if (response.ok) {
        const data = await response.json();
        const messages = data.data.reverse() || [];
        setMessages((prev) => [...messages, ...prev]);
        cursorRef.current = data.meta?.nextCursor;
        setHasMore(data.meta?.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  };

  const newMessage = async (messageId: string) => {
    try {
      const response = await fetchWithAuth(`messages/${messageId}`);
      if (response.ok) {
        const message = await response.json();
        
        if(message.fileName) {
          message.content = '🎤  Processing audio...'
        }
        setMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to add new message:', error);
      setError('Failed to add new message');
    }
  };

  const updateMessage = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, content: newContent } : message
      )
    );
  };


  const deleteMessage = (messageId: string) =>  {
    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  }

  return {
    messages,
    isLoading,
    hasMore,
    error,
    loadMessages,
    loadMoreMessages,
    newMessage,
    updateMessage,
    deleteMessage,
  };
};

export default useChat;
