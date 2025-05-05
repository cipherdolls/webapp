import { Link, useRouteLoaderData } from 'react-router';
import type { User } from '~/types';
import { Icons } from './ui/icons';
import * as Popover from '~/components/ui/popover';

type PopoverLinkItem = {
  text: string;
  href: string;
  isDelete?: boolean;
};

type ViewButtonProps = {
  userId?: string;
  popoverItems: PopoverLinkItem[];
  className?: string;
  isDataCard?: boolean;
};

export const ViewButton = ({ userId, popoverItems, className, isDataCard }: ViewButtonProps) => {
  const me = useRouteLoaderData('routes/_main') as User;
  if (me.role !== 'ADMIN' && me.id !== userId) {
    return null;
  }
  return (
    <Popover.Root>
      <Popover.Trigger className={className}>
        <Icons.more className='text-pink-01 group-hover:text-base-black' />
      </Popover.Trigger>
      <Popover.Content side='bottom' align='end' className='flex flex-col'>
        {popoverItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={`cursor-pointer w-full py-3.5 px-3 ${
              item.isDelete ? 'hover:bg-specials-danger/10 text-specials-danger' : 'hover:bg-neutral-05 text-base-black'
            } bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
          >
            {item.text}
          </Link>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
};
