import { useState, useRef, useEffect } from 'react';

interface UseCopyToClipboardOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseCopyToClipboardResult {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
  resetCopied: () => void;
}

/**
 * A hook to handle copying text to clipboard with feedback state
 *
 * @param options Configuration options
 * @returns Object containing copy state and functions
 */
export function useCopyToClipboard(options?: UseCopyToClipboardOptions): UseCopyToClipboardResult {
  const { timeout = 2000, onSuccess, onError } = options || {};

  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const resetCopied = () => {
    setCopied(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Set new timeout to reset copied state
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, timeout);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy to clipboard');

      // Call error callback if provided
      if (onError) {
        onError(error);
      }

      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
}
