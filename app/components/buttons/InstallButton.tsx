import { useCallback, useState } from 'react';
import { connect } from 'esp-web-tools/dist/connect.js';

type InstallButtonProps = {
  manifest: string;
  eraseFirst?: boolean;
  hideProgress?: boolean;
  showLog?: boolean;
  logConsole?: boolean;
  overrides?: Record<string, unknown>;
  label?: string;
};

export const InstallButton = ({
  manifest,
  eraseFirst = false,
  hideProgress = false,
  showLog = false,
  logConsole = false,
  overrides,
  label = 'Install Firmware',
}: InstallButtonProps) => {
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setInstalling(true);
    setError(null);

    try {
      await connect({
        manifest,
        eraseFirst,
        hideProgress,
        showLog,
        logConsole,
        overrides,
      } as any); // `connect()` expects a Web Component, so we fake its shape
    } catch (err) {
      setError((err as Error).message || 'Install failed');
    } finally {
      setInstalling(false);
    }
  }, [manifest, eraseFirst, hideProgress, showLog, logConsole, overrides]);

  if (!('serial' in navigator)) {
    return <p>Your browser does not support Web Serial. Try Chrome or Edge.</p>;
  }

  if (!window.isSecureContext) {
    return <p>Firmware flashing only works on HTTPS or localhost.</p>;
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        onClick={handleClick}
        disabled={installing}
        style={{
          position: 'relative',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 24px',
          border: 'none',
          borderRadius: '9999px',
          color: '#fff',
          backgroundColor: '#000000',
          opacity: installing ? 0.5 : 1,
          pointerEvents: installing ? 'none' : 'auto',
        }}
      >
        {installing ? 'Installing...' : label}
      </button>

      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  );
};
