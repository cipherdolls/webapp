import { Link, NavLink, Outlet } from 'react-router';
import type { Route } from './+types/_main._general.doll-bodies._index';
import { useDollBodies } from '~/hooks/queries/dollQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Doll Bodies - CipherDolls' },
    { name: 'description', content: 'Browse available doll bodies for your CipherDolls companion.' },
  ];
}

function DollBodiesSkeleton() {
  return (
    <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='rounded-xl bg-neutral-04 w-full animate-pulse h-[296px]' />
      ))}
    </div>
  );
}

export default function DollBodies() {
  const { data: dollBodies = [], isLoading, isError } = useDollBodies();
  const { data: user } = useUser();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold'>Doll Bodies</h2>
        {isAdmin && (
          <NavLink to={ROUTES.dollBodiesNew}>
            <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
              <Button.Icon as={Icons.add} />
              Add Doll Body
            </Button.Root>
          </NavLink>
        )}
      </div>

      {isLoading ? (
        <DollBodiesSkeleton />
      ) : isError ? (
        <p className='text-body-md text-red-500 text-center py-10'>Failed to load doll bodies.</p>
      ) : dollBodies.length === 0 ? (
        <div className='rounded-xl bg-gradient-1 py-10 px-6 flex flex-col items-center justify-center gap-2'>
          <h1 className='text-heading-h2'>🤖</h1>
          <h4 className='text-heading-h4 text-base-black'>No Doll Bodies Available</h4>
          <p className='text-body-md text-neutral-01'>Check back later for new doll bodies.</p>
        </div>
      ) : (
        <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
          {dollBodies.map((dollBody) => (
            <Link
              key={dollBody.id}
              to={`${ROUTES.dollBodies}/${dollBody.id}`}
              className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden hover:shadow-bottom-level-2 transition-shadow'
            >
              <div className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                <img
                  src={getPicture(dollBody, 'doll-bodies', false)}
                  srcSet={getPicture(dollBody, 'doll-bodies', true)}
                  alt={`${dollBody.name} picture`}
                  className='object-cover size-full'
                />
              </div>
              <div className='py-[18px] px-5 flex flex-col gap-1'>
                <h4 className='truncate text-heading-h4 text-base-black'>{dollBody.name}</h4>
                {dollBody.description && <p className='text-body-md text-neutral-01 line-clamp-2'>{dollBody.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Outlet />
    </div>
  );
}
