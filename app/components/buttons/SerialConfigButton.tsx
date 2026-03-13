import { useState, useCallback } from 'react';

type SerialConfigButtonProps = {
  apiKey: string;
  className?: string;
};

export const SerialConfigButton = ({ apiKey, className }: SerialConfigButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (typeof window !== 'undefined' && !('serial' in navigator)) {
    return null;
  }

  const configure = useCallback(async () => {
    if (!apiKey) {
      setStatus('error');
      setMessage('No API key available');
      return;
    }

    try {
      setStatus('sending');
      setMessage('Select your device...');

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      // Send API key
      const encoder = new TextEncoder();
      const writer = port.writable!.getWriter();
      await writer.write(encoder.encode(`APIKEY:${apiKey}\n`));
      writer.releaseLock();

      // Read response
      const reader = port.readable!.getReader();
      const decoder = new TextDecoder();
      let result = '';
      const timeout = setTimeout(() => reader.cancel(), 3000);

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
          if (result.includes('\n')) break;
        }
      } catch {
        // timeout or cancel
      } finally {
        clearTimeout(timeout);
        reader.releaseLock();
      }

      await port.close();

      if (result.includes('OK:APIKEY')) {
        setStatus('done');
        setMessage('API key configured successfully');
      } else {
        setStatus('error');
        setMessage('No confirmation from device');
      }
    } catch (e) {
      setStatus('error');
      setMessage(`Failed: ${(e as Error).message}`);
    }
  }, [apiKey]);

  return (
    <div className={className}>
      <button
        onClick={configure}
        disabled={status === 'sending'}
        style={{
          cursor: status === 'sending' ? 'wait' : 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 24px',
          border: 'none',
          borderRadius: '9999px',
          color: '#fff',
          backgroundColor: status === 'done' ? '#16a34a' : '#333',
        }}
      >
        {status === 'sending' ? 'Configuring...' : status === 'done' ? 'Configured' : 'Configure API Key'}
      </button>
      {message && <p className={`text-body-sm mt-2 ${status === 'error' ? 'text-red-500' : 'text-neutral-02'}`}>{message}</p>}
    </div>
  );
};
