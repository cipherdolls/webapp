import { Link } from 'react-router';
import type { Route } from './+types/_main._general.doll-bodies.$id';
import { useDollBody } from '~/hooks/queries/dollQueries';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import { ROUTES } from '~/constants';
import ErrorPage from '~/components/ErrorPage';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll Body - CipherDolls' }];
}

export default function DollBodyShow({ params }: Route.ComponentProps) {
  const { data: dollBody, isLoading, error } = useDollBody(params.id);

  if (isLoading) {
    return (
      <div className='w-full flex flex-col gap-5 sm:mt-8'>
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-8 max-w-[200px]' />
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[300px] sm:h-[400px]' />
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-6 max-w-[400px]' />
      </div>
    );
  }

  if (error || !dollBody) {
    return <ErrorPage code={(error as any)?.code} message={(error as any)?.message} />;
  }

  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <Link to={ROUTES.dollBodies} className='flex items-center gap-3 sm:gap-4'>
          <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
          <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap hover:underline transition-all duration-200'>
            {dollBody.name}
          </h3>
        </Link>
      </div>

      <div className='flex md:flex-row flex-col-reverse gap-5 rounded-xl pb-2.5 md:gap-0 md:divide-x divide-neutral-04'>
        <div className='flex flex-col gap-4 md:pr-4 w-full'>
          {dollBody.description && (
            <div className='bg-gradient-1 rounded-xl p-5'>
              <h4 className='text-heading-h4 text-base-black mb-3'>Description</h4>
              <p className='text-body-md text-neutral-01 whitespace-pre-wrap'>{dollBody.description}</p>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-10 md:pl-4 md:max-w-[310px] w-full'>
          <label className='sm:h-60 h-[263px] w-full bg-neutral-04 sm:bg-gradient-1 flex flex-col justify-end items-center gap-3.5 rounded-xl relative'>
            {dollBody.picture ? (
              <div className='size-full'>
                <img
                  src={getPicture(dollBody, 'doll-bodies', false)}
                  srcSet={getPicture(dollBody, 'doll-bodies', true)}
                  alt={dollBody.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>
            ) : (
              <div className='flex items-center justify-center size-full'>
                <Icons.fileUploadIcon />
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
