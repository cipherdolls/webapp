import type { ApiError } from "~/types";

export async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiError;

  
  try {
   
    const parsed = await response.json();
    // Ensure the parsed result matches ApiError structure
    errorData = {
      error: parsed?.error ?? 'Unknown',
      message: Array.isArray(parsed?.message)
        ? parsed.message
        : [parsed?.message ?? 'Request failed'],
      statusCode: parsed?.statusCode ?? response.status,
    };
  } catch {
    // fallback if not a valid JSON
    errorData = {
      error: 'Unknown',
      message: ['Request failed, invalid error response'],
      statusCode: response.status,
    };
  }

  // Always have a valid errorData here!
  const error = new Error(errorData.message.join(', '));
  (error as any).apiError = errorData;
  throw error;
}