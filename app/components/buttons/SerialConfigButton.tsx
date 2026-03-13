import { useState, useCallback, useRef } from 'react';
import * as Button from '~/components/ui/button/button';

type SerialConfigButtonProps = {
  apiKey: string;
  className?: string;
};

type ConfigState = {
  apikey: 'idle' | 'sending' | 'done' | 'error';
  volume: 'idle' | 'sending' | 'done' | 'error';
};

async function sendCommand(port: any, command: string, expectedResponse: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const writer = port.writable!.getWriter();
  await writer.write(encoder.encode(`${command}\n`));
  writer.releaseLock();

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

  return result.includes(expectedResponse);
}

export const SerialConfigButton = ({ apiKey, className }: SerialConfigButtonProps) => {
  const [configState, setConfigState] = useState<ConfigState>({ apikey: 'idle', volume: 'idle' });
  const [volume, setVolume] = useState(70);
  const [error, setError] = useState('');
  const portRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  if (typeof window !== 'undefined' && !('serial' in navigator)) {
    return null;
  }

  const connect = useCallback(async () => {
    try {
      setError('');
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setConnected(true);
    } catch (e) {
      setError(`Connection failed: ${(e as Error).message}`);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // ignore
    }
    setConnected(false);
    setConfigState({ apikey: 'idle', volume: 'idle' });
  }, []);

  const sendApiKey = useCallback(async () => {
    if (!portRef.current || !apiKey) return;
    setConfigState((s) => ({ ...s, apikey: 'sending' }));
    try {
      const ok = await sendCommand(portRef.current, `APIKEY:${apiKey}`, 'OK:APIKEY');
      setConfigState((s) => ({ ...s, apikey: ok ? 'done' : 'error' }));
    } catch {
      setConfigState((s) => ({ ...s, apikey: 'error' }));
    }
  }, [apiKey]);

  const sendVolume = useCallback(async () => {
    if (!portRef.current) return;
    setConfigState((s) => ({ ...s, volume: 'sending' }));
    try {
      const ok = await sendCommand(portRef.current, `VOLUME:${volume}`, 'OK:VOLUME');
      setConfigState((s) => ({ ...s, volume: ok ? 'done' : 'error' }));
    } catch {
      setConfigState((s) => ({ ...s, volume: 'error' }));
    }
  }, [volume]);

  if (!connected) {
    return (
      <div className={className}>
        <Button.Root variant='secondary' onClick={connect}>
          Connect Device
        </Button.Root>
        {error && <p className='text-body-sm text-red-500 mt-2'>{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      <div className='flex items-center justify-between'>
        <span className='text-body-sm text-green-600'>Device connected</span>
        <button onClick={disconnect} className='text-body-sm text-neutral-02 underline'>
          Disconnect
        </button>
      </div>

      <div className='flex items-center justify-between'>
        <span className='text-body-md text-neutral-01'>API Key</span>
        <Button.Root
          variant='secondary'
          onClick={sendApiKey}
          disabled={configState.apikey === 'sending'}
          className='w-[100px]'
        >
          {configState.apikey === 'sending' ? '...' : configState.apikey === 'done' ? 'Sent' : 'Send'}
        </Button.Root>
      </div>

      <div className='flex items-center justify-between gap-4'>
        <span className='text-body-md text-neutral-01 shrink-0'>Volume</span>
        <input
          type='range'
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className='flex-1'
        />
        <span className='text-body-sm text-neutral-02 w-8 text-right'>{volume}</span>
        <Button.Root
          variant='secondary'
          onClick={sendVolume}
          disabled={configState.volume === 'sending'}
          className='w-[100px]'
        >
          {configState.volume === 'sending' ? '...' : configState.volume === 'done' ? 'Sent' : 'Send'}
        </Button.Root>
      </div>

      {error && <p className='text-body-sm text-red-500'>{error}</p>}
    </div>
  );
};
