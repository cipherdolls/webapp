import React from 'react';
import { Link } from 'react-router';
import { toast, Toaster } from 'sonner';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ShowToastProps {
  emoji?: string;
  title?: string;
  description?: string;
  actionLink?: string;
  actionText?: string;
  duration?: number;
}

export interface CustomToasterProps {
  position?: ToastPosition;
}

export const CustomToaster: React.FC<CustomToasterProps> = ({ position = 'top-right' }) => {
  return (
    <Toaster
      position={position}
      toastOptions={{
        unstyled: true,
      }}
    />
  );
};

export const showToast = ({ emoji, title, description, actionLink, actionText, duration = 1500 }: ShowToastProps) => {
  return toast.custom(
    (t) => (
      <div className='flex items-center gap-4 px-4 py-3 bg-gradient-1 backdrop-blur-48 rounded-[10px] shadow-floating-banner w-[368px]'>
        {emoji && <h2 className='text-heading-h2 shrink-0'>{emoji}</h2>}

        <div className='flex-1 min-w-0 flex flex-col gap-1'>
          {title && <p className='text-body-sm font-semibold text-base-black truncate'>{title}</p>}
          {description && <p className='text-body-sm text-base-black truncate'>{description}</p>}
        </div>

        <div className='flex-shrink-0'>
          {actionLink && actionText ? (
            <Link
              to={actionLink}
              className='text-body-sm font-semibold text-base-black hover:text-base-black/50 transition-colors'
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={() => toast.dismiss(t)}
              className='py-1 text-body-sm font-semibold text-base-black hover:text-base-black/50 transition-colors'
            >
              OK
            </button>
          )}
        </div>
      </div>
    ),
    {
      duration,
    }
  );
};
