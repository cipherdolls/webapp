import { Link } from 'react-router';
import { Icons } from './ui/icons';
import * as Popover from '~/components/ui/popover';
import { cn } from '~/utils/cn';
import { useUser } from '~/hooks/queries/userQueries';

type PopoverItem = {
  text: string;
  href?: string;
  onClick?: () => void;
  isDelete?: boolean;
};

type ViewButtonProps = {
  userId?: string;
  popoverItems: PopoverItem[];
  className?: string;
  isDataCard?: boolean;
};

export const ViewButton = ({ userId, popoverItems, className, isDataCard }: ViewButtonProps) => {
  const { data: me } = useUser();
  if (!me || (me.role !== 'ADMIN' && me.id !== userId)) {
    return null;
  }
  return (
    <Popover.Root>
      <Popover.Trigger className={cn('group navigation-exclude', className)}>
        <Icons.more className='text-pink-01 group-hover:text-base-black transition-colors' />
      </Popover.Trigger>
      <Popover.Content side='bottom' align='end' className='flex flex-col navigation-exclude'>
        {popoverItems.map((item, index) => {
          const className = `cursor-pointer w-full py-3.5 px-3 navigation-exclude text-left ${
            item.isDelete ? 'hover:bg-specials-danger/10 text-specials-danger' : 'hover:bg-neutral-05 text-base-black'
          } bg-white transition-colors duration-200 text-body-md font-semibold rounded-[10px]`;
          
          if (item.href) {
            return (
              <Link key={index} to={item.href} className={className}>
                {item.text}
              </Link>
            );
          }
          
          return (
            <button key={index} onClick={item.onClick} className={className}>
              {item.text}
            </button>
          );
        })}
      </Popover.Content>
    </Popover.Root>
  );
};
