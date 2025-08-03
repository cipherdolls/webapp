import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { handleApiError } from '~/utils/handleApiError';

// Create message mutation
export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, formData }: { chatId: string; formData: FormData }) => {
      const response = await fetchWithAuth(`messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newMessage, variables) => {
      // Invalidate messages for the specific chat
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      // Invalidate the specific message
      queryClient.invalidateQueries({ queryKey: ['message', newMessage.id] });
    },
  });
}

// Delete message mutation
export function useDeleteMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetchWithAuth(`messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return { messageId };
    },
    onSuccess: ({ messageId }) => {
      queryClient.removeQueries({ queryKey: ['message', messageId] });
      queryClient.setQueryData(['messages', chatId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((msg: any) => msg.id !== messageId),
          })),
        };
      });
    },
  });
}

// Send message with audio (if supported)
export function useSendAudioMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, audioFile }: { chatId: string; audioFile: File }) => {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetchWithAuth(`chats/${chatId}/messages/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }
      return response.json();
    },
    onSuccess: (newMessage, variables) => {
      // Invalidate messages for the specific chat
      queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
      // Invalidate the specific message
      queryClient.invalidateQueries({ queryKey: ['message', newMessage.id] });
    },
  });
}

// Retry failed message
// export function useRetryMessage() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (messageId: string) => {
//       const response = await fetchWithAuth(`messages/${messageId}/retry`, {
//         method: 'POST',
//       });

//       if (!response.ok) {
//         await handleApiError(response);
//       }
//       return response.json();
//     },
//     onSuccess: (retriedMessage) => {
//       // Invalidate the specific message
//       queryClient.invalidateQueries({ queryKey: ['message', retriedMessage.id] });
//       // Invalidate messages for the chat
//       queryClient.invalidateQueries({ queryKey: ['messages'] });
//     },
//   });
// }
