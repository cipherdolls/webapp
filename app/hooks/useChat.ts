import { useState } from 'react';
import type { Message } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

const useChat = (chatId: string, { limit = 50 }: { limit?: number } = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMessages = async (page: number = 1) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`messages?chatId=${chatId}&limit=${limit}&page=${page}&order=desc`);
     
      if (response.ok) {
        const data = await response.json();
        const messages = data.data.reverse() || [];
        setMessages(messages);
        setCurrentPage(page);
        setHasMore(currentPage < (data.meta?.totalPages || 1));
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
      const response = await fetchWithAuth(`messages?chatId=${chatId}&limit=${limit}&page=${currentPage + 1}&order=desc`);
      if (response.ok) {
        const data = await response.json();
        const messages = data.data.reverse() || [];
        setMessages((prev) => [...messages, ...prev]);
        setCurrentPage(currentPage + 1);
        setHasMore(currentPage < (data.meta?.totalPages || 1));
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    hasMore,
    error,
    loadMessages,
    loadMoreMessages,
  };
};

export default useChat;
