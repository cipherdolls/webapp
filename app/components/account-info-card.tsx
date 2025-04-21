import { cn } from '~/utils/cn';
import { Icons } from './ui/icons';
import { type ReactNode } from 'react';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { Link } from 'react-router';

interface AccountInfoCardProps {
  label: string;
  value: string;
  link?: string;
  information?: ReactNode;
  className?: string;
}

const AccountInfoCard = ({ label, value, link, information, className }: AccountInfoCardProps) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className='flex flex-col gap-4 sm:gap-5'>
      <div className='flex items-center justify-between'>
        <h3 className='sm:text-heading-h3 text-heading-h4 text-base-black'>{label}</h3>
        {information && information}
      </div>
      <div className='sm:py-0.5 sm:px-5 px-3 w-full rounded-xl bg-base-white shadow-regular'>
        <div className={cn('py-4.5 flex items-center gap-5', className)}>
          {link ? (
            <Link
              to={link}
              target='_blank'
              className={cn('text-base-black text-body-md font-semibold line-clamp-1 break-all', link && 'underline')}
            >
              {value}
            </Link>
          ) : (
            <p className={cn('text-base-black text-body-md font-semibold line-clamp-1 break-all')}>{value}</p>
          )}
          <button onClick={() => copyToClipboard(value)} className='bg-transparent hover:bg-neutral-05 rounded-full transition-colors'>
            {copied ? <Icons.copied /> : <Icons.copy />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard;
