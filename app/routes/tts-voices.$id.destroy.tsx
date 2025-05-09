import { redirect } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

// Define Route namespace for type definitions
namespace Route {
  export type ActionArgs = {
    request: Request;
    params: {
      id: string;
    };
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const res = await fetchWithAuth(`tts-voices/${params.id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        errors: data.message || 'Failed to delete TTS voice',
      };
    }

    return redirect('/services/tts');
  } catch (error) {
    console.error('Error deleting TTS voice:', error);
    return {
      errors: 'Something went wrong. Please try again.',
    };
  }
}