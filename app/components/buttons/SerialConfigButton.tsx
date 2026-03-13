import { useState, useCallback } from 'react';

type SerialConfigButtonProps = {
  className?: string;
};

export const SerialConfigButton = ({ className }: SerialConfigButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [port, setPort] = useState<SerialPort | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');

  if (typeof window !== 'undefined' && !('serial' in navigator)) {
    return null;
  }

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      setPort(selectedPort);
      setStatus('connected');
    } catch (e) {
      setStatus('error');
      setResponse(`Connection failed: ${(e as Error).message}`);
    }
  }, []);

  const sendCommand = useCallback(
    async (command: string) => {
      if (!port?.writable || !port?.readable) return;

      const encoder = new TextEncoder();
      const writer = port.writable.getWriter();
      await writer.write(encoder.encode(command + '\n'));
      writer.releaseLock();

      // Read response
      const reader = port.readable.getReader();
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

      return result.trim();
    },
    [port]
  );

  const handleSendApiKey = useCallback(async () => {
    if (!apiKey.trim()) return;
    const result = await sendCommand(`APIKEY:${apiKey.trim()}`);
    setResponse(result || 'No response');
    if (result?.includes('OK:APIKEY')) {
      setApiKey('');
    }
  }, [apiKey, sendCommand]);

  const handleGetConfig = useCallback(async () => {
    const result = await sendCommand('GETCONFIG');
    setResponse(result || 'No response');
  }, [sendCommand]);

  const disconnect = useCallback(async () => {
    if (port) {
      await port.close();
      setPort(null);
    }
    setStatus('idle');
    setResponse('');
  }, [port]);

  if (status === 'idle' || status === 'error') {
    return (
      <div className={className}>
        <button
          onClick={connect}
          style={{
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px 24px',
            border: 'none',
            borderRadius: '9999px',
            color: '#fff',
            backgroundColor: '#333',
          }}
        >
          Configure Device
        </button>
        {response && <p className='text-body-sm text-red-500 mt-2'>{response}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className || ''}`}>
      <div className='flex items-center gap-2'>
        <span className='text-body-sm text-green-600'>Connected</span>
        <button onClick={disconnect} className='text-body-sm text-neutral-02 underline cursor-pointer'>
          Disconnect
        </button>
      </div>

      <div className='flex items-center gap-2'>
        <input
          type='text'
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder='Paste API key'
          className='border border-neutral-04 rounded-lg px-3 py-2 text-body-sm flex-1'
          onKeyDown={(e) => e.key === 'Enter' && handleSendApiKey()}
        />
        <button
          onClick={handleSendApiKey}
          style={{
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: '8px 16px',
            border: 'none',
            borderRadius: '9999px',
            color: '#fff',
            backgroundColor: '#000',
          }}
        >
          Set API Key
        </button>
      </div>

      <button onClick={handleGetConfig} className='text-body-sm text-neutral-02 underline cursor-pointer text-left'>
        Get current config
      </button>

      {response && (
        <pre className='text-body-sm text-neutral-01 bg-neutral-05 rounded-lg p-3 whitespace-pre-wrap break-all'>{response}</pre>
      )}
    </div>
  );
};
