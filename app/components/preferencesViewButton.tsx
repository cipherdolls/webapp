import { Link, useRouteLoaderData } from 'react-router';
import type { User } from '~/types';
import { Icons } from './ui/icons';

export const ViewButton = ({ link, userId }: { link: string; userId: string }) => {
  const me = useRouteLoaderData('routes/_main') as User;
  if (me.role !== 'ADMIN' && me.id !== userId) {
    return null;
  }
  return (
    <Link to={link} className='hover:opacity-50 transition-colors'>
      <Icons.eye className='text-base-black' />
    </Link>
  );
};
