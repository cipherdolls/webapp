import { useState, useCallback, useRef, useEffect } from 'react';

type SerialConfigButtonProps = {
  apiKey: string;
  className?: string;
};

type ConfigState = {
  apikey: 'idle' | 'sending' | 'done' | 'error';
  volume: 'idle' | 'sending' | 'done' | 'error';
};

export const SerialConfigButton = ({ apiKey, className }: SerialConfigButtonProps) => {
  const [configState, setConfigState] = useState<ConfigState>({ apikey: 'idle', volume: 'idle' });
  const [volume, setVolume] = useState(70);
  const [error, setError] = useState('');
  const portRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logReaderRef = useRef<ReadableStreamDefaultReader | null>(null);
  const logAbortRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Cleanup: close serial port on unmount (e.g. tab switch)
  useEffect(() => {
    return () => {
      logAbortRef.current = true;
      const reader = logReaderRef.current;
      const port = portRef.current;
      portRef.current = null;
      logReaderRef.current = null;
      (async () => {
        try { if (reader) await reader.cancel(); } catch {}
        try { if (reader) reader.releaseLock(); } catch {}
        try { if (port) await port.close(); } catch {}
      })();
    };
  }, []);

  if (typeof window !== 'undefined' && !('serial' in navigator)) {
    return null;
  }

  const startLogReader = (port: any) => {
    logAbortRef.current = false;
    const decoder = new TextDecoder();
    let buffer = '';

    const read = async () => {
      while (!logAbortRef.current) {
        let reader: ReadableStreamDefaultReader | null = null;
        try {
          reader = port.readable!.getReader();
          logReaderRef.current = reader;
          while (!logAbortRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value);
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            if (lines.length > 0) {
              // Strip ANSI escape codes (color codes from ESP_LOG)
              const clean = lines.map((l) => l.replace(/\x1b\[[0-9;]*m/g, ''));
              setLogs((prev) => [...prev.slice(-200), ...clean]);
            }
          }
        } catch {
          // reader was cancelled (for sendCommand) or port closed
        } finally {
          try {
            if (reader) reader.releaseLock();
          } catch {}
          logReaderRef.current = null;
        }
        // Small delay before re-acquiring reader (after sendCommand releases it)
        if (!logAbortRef.current) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    };
    read();
  };

  const sendCommand = async (command: string, expectedResponse: string): Promise<boolean> => {
    const port = portRef.current;
    if (!port) return false;

    // Cancel log reader so we can use the port
    try {
      await logReaderRef.current?.cancel();
    } catch {}

    // Small delay for reader to release
    await new Promise((r) => setTimeout(r, 50));

    const encoder = new TextEncoder();
    const writer = port.writable!.getWriter();
    await writer.write(encoder.encode(`${command}\n`));
    writer.releaseLock();

    const reader = port.readable!.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let found = false;
    const timeout = setTimeout(() => reader.cancel(), 5000);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        if (result.includes(expectedResponse)) {
          found = true;
          break;
        }
      }
    } catch {
      // timeout or cancel
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }

    // Log the command + response lines (strip ANSI codes)
    const cleanLines = result
      .replace(/\x1b\[[0-9;]*m/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setLogs((prev) => [...prev.slice(-200), `> ${command}`, ...cleanLines]);

    return found;
  };

  const connect = useCallback(async () => {
    try {
      setError('');
      setLogs([]);
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setConnected(true);
      startLogReader(port);
    } catch (e) {
      setError(`Connection failed: ${(e as Error).message}`);
    }
  }, []);

  const disconnect = useCallback(async () => {
    logAbortRef.current = true;
    try {
      await logReaderRef.current?.cancel();
    } catch {}
    try {
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {}
    setConnected(false);
    setConfigState({ apikey: 'idle', volume: 'idle' });
  }, []);

  const sendApiKey = useCallback(async () => {
    if (!portRef.current || !apiKey) return;
    setConfigState((s) => ({ ...s, apikey: 'sending' }));
    try {
      const ok = await sendCommand(`APIKEY:${apiKey}`, 'OK:APIKEY');
      setConfigState((s) => ({ ...s, apikey: ok ? 'done' : 'error' }));
    } catch {
      setConfigState((s) => ({ ...s, apikey: 'error' }));
    }
  }, [apiKey]);

  const sendVolume = useCallback(async () => {
    if (!portRef.current) return;
    setConfigState((s) => ({ ...s, volume: 'sending' }));
    try {
      const ok = await sendCommand(`VOLUME:${volume}`, 'OK:VOLUME');
      setConfigState((s) => ({ ...s, volume: ok ? 'done' : 'error' }));
    } catch {
      setConfigState((s) => ({ ...s, volume: 'error' }));
    }
  }, [volume]);

  if (!connected) {
    return (
      <div className={className}>
        <button
          onClick={connect}
          style={{
            cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            padding: '10px 24px', border: 'none', borderRadius: '9999px',
            color: '#fff', backgroundColor: '#000000',
          }}
        >
          Connect
        </button>
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
        <button
          onClick={sendApiKey}
          disabled={configState.apikey === 'sending'}
          style={{
            cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            padding: '10px 24px', border: 'none', borderRadius: '9999px',
            color: '#fff', backgroundColor: '#000000',
            width: '100px', opacity: configState.apikey === 'sending' ? 0.5 : 1,
          }}
        >
          {configState.apikey === 'sending' ? '...' : configState.apikey === 'done' ? 'Sent' : 'Send'}
        </button>
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
        <button
          onClick={sendVolume}
          disabled={configState.volume === 'sending'}
          style={{
            cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            padding: '10px 24px', border: 'none', borderRadius: '9999px',
            color: '#fff', backgroundColor: '#000000',
            width: '100px', opacity: configState.volume === 'sending' ? 0.5 : 1,
          }}
        >
          {configState.volume === 'sending' ? '...' : configState.volume === 'done' ? 'Sent' : 'Send'}
        </button>
      </div>

      <div className='bg-black rounded-lg p-3 max-h-[300px] overflow-y-auto font-mono text-xs text-green-400'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-neutral-02 text-[10px] uppercase tracking-wider'>Serial Monitor</span>
          <button onClick={() => setLogs([])} className='text-neutral-02 text-[10px] hover:text-white'>
            Clear
          </button>
        </div>
        {logs.length === 0 ? (
          <p className='text-neutral-02'>Listening...</p>
        ) : (
          logs.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-yellow-400' : ''}>
              {line}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {error && <p className='text-body-sm text-red-500'>{error}</p>}
    </div>
  );
};
