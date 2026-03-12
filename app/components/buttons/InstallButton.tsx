import { useEffect, useRef } from 'react';

type InstallButtonProps = {
  manifest: string;
  label?: string;
  className?: string;
};

export const InstallButton = ({ manifest, label = 'Install Firmware', className }: InstallButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import esp-web-tools to register the custom element
    import('esp-web-tools');
  }, []);

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
    </div>
  );
};
