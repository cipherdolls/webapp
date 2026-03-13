import { useEffect, useRef, useState } from 'react';

type InstallButtonProps = {
  manifest: string;
  apiKey?: string;
  label?: string;
  className?: string;
};

export const InstallButton = ({ manifest, apiKey, label = 'Install Firmware', className }: InstallButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [configStatus, setConfigStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => {
    import('esp-web-tools');
  }, []);

  useEffect(() => {
    if (!apiKey || !ref.current) return;

    const btn = ref.current.querySelector('esp-web-install-button');
    if (!btn) return;

    const handleStateChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.state === 'finished') {
        // Flash succeeded — wait for dialog to close, then send API key
        const dialog = document.querySelector('ewt-install-dialog');
        if (dialog) {
          dialog.addEventListener(
            'closed',
            async () => {
              // Wait for port to be fully released
              await new Promise((r) => setTimeout(r, 1000));
              await sendApiKey(apiKey, setConfigStatus);
            },
            { once: true }
          );
        }
      }
    };

    btn.addEventListener('state-changed', handleStateChanged);
    return () => btn.removeEventListener('state-changed', handleStateChanged);
  }, [apiKey]);

  if (typeof window !== 'undefined' && !('serial' in navigator)) {
    return <p className='text-body-sm text-neutral-02'>Your browser does not support Web Serial. Try Chrome or Edge.</p>;
  }

  return (
    <div ref={ref} className={className}>
      {/* @ts-expect-error esp-web-install-button is a custom element */}
      <esp-web-install-button manifest={manifest}>
        <button
          slot='activate'
          style={{
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px 24px',
            border: 'none',
            borderRadius: '9999px',
            color: '#fff',
            backgroundColor: '#000000',
          }}
        >
          {label}
        </button>
      </esp-web-install-button>
      {configStatus === 'sending' && <p className='text-body-sm text-neutral-02 mt-2'>Sending API key...</p>}
      {configStatus === 'done' && <p className='text-body-sm text-green-600 mt-2'>API key configured</p>}
      {configStatus === 'error' && <p className='text-body-sm text-red-500 mt-2'>Failed to send API key</p>}
    </div>
  );
};

async function sendApiKey(apiKey: string, setStatus: (s: 'idle' | 'sending' | 'done' | 'error') => void) {
  try {
    setStatus('sending');

    // Browser remembers previously granted ports from the flash dialog
    const ports = await (navigator as any).serial.getPorts();
    let port: any = ports.length > 0 ? ports[0] : null;

    if (!port) {
      port = await (navigator as any).serial.requestPort();
    }

    await port!.open({ baudRate: 115200 });

    const encoder = new TextEncoder();
    const writer = port!.writable!.getWriter();
    await writer.write(encoder.encode(`APIKEY:${apiKey}\n`));
    writer.releaseLock();

    const reader = port!.readable!.getReader();
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
      // timeout
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }

    await port!.close();

    if (result.includes('OK:APIKEY')) {
      setStatus('done');
    } else {
      setStatus('error');
    }
  } catch (e) {
    console.error('Failed to send API key:', e);
    setStatus('error');
  }
}
