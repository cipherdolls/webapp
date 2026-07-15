import { Link, NavLink, Outlet } from 'react-router';
import type { Route } from './+types/_main._general.groups._index';
import { useGroups } from '~/hooks/queries/groupQueries';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Groups - CipherDolls' },
    { name: 'description', content: 'Curate avatars and scenarios into groups.' },
  ];
}

function GroupsSkeleton() {
  return (
    <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='rounded-xl bg-neutral-04 w-full animate-pulse h-[296px]' />
      ))}
    </div>
  );
}

export default function Groups() {
  const { data: groupsPaginated, isLoading, isError } = useGroups({ limit: '100' });
  const groups = groupsPaginated?.data || [];

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold'>Groups</h2>
        <NavLink to={ROUTES.groupsNew}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add Group
          </Button.Root>
        </NavLink>
      </div>

      {isLoading ? (
        <GroupsSkeleton />
      ) : isError ? (
        <p className='text-body-md text-red-500 text-center py-10'>Failed to load groups.</p>
      ) : groups.length === 0 ? (
        <div className='rounded-xl bg-gradient-1 py-10 px-6 flex flex-col items-center justify-center gap-2'>
          <h1 className='text-heading-h2'>🗂️</h1>
          <h4 className='text-heading-h4 text-base-black'>No Groups Yet</h4>
          <p className='text-body-md text-neutral-01'>Create a group to curate avatars and scenarios for a dedicated site.</p>
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`${ROUTES.groups}/${group.id}`}
              className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden hover:shadow-bottom-level-2 transition-shadow'
            >
              <div className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                <img
                  src={getPicture(group, 'groups', false)}
                  srcSet={getPicture(group, 'groups', true)}
                  alt={`${group.name} picture`}
                  className='object-cover size-full'
                />
                {!group.published && (
                  <span className='absolute top-2 right-2 text-xs bg-base-black text-white px-2 py-1 rounded'>Draft</span>
                )}
              </div>
              <div className='py-[18px] px-5 flex flex-col gap-1'>
                <h4 className='truncate text-heading-h4 text-base-black'>{group.name}</h4>
                <p className='text-xs text-neutral-01'>/{group.slug}</p>
                {group.description && <p className='text-body-md text-neutral-01 line-clamp-2'>{group.description}</p>}
                <p className='text-xs text-neutral-01 mt-1'>
                  {group._count?.avatars ?? 0} avatar{(group._count?.avatars ?? 0) !== 1 ? 's' : ''} ·{' '}
                  {group._count?.scenarios ?? 0} scenario{(group._count?.scenarios ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Outlet />
    </div>
  );
}
