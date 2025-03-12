import { Form, Link, Outlet, redirect, useFetcher, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { PATHS, PICTURE_SIZE } from '~/constants';
import * as Button from '~/components/ui/button/button';
import PlayerButton from '~/components/PlayerButton';
import ReactMarkdown from 'react-markdown';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, DollBody, User } from '~/types';
import type { Route } from './+types/_main._general.doll-bodies.$dollBodyId';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll Body' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`doll-bodies/${params.dollBodyId}`);
  return await res.json();
}



export default function DollBodyShow({ loaderData }: Route.ComponentProps) {
  const dollBody: DollBody = loaderData;
  const {name, description, picture} = dollBody
  const fetcher = useFetcher();


  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <Link to={'/preferences/doll-bodies'} className='flex items-center gap-3 sm:gap-4'>
          <Icons.chevronLeft />
          <div className='flex sm:items-center sm:flex-row flex-col sm:gap-3 gap-1'>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{dollBody.name}</h3>
            <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
          </div>
        </Link>
        <div className='md:flex hidden items-center gap-3'>
          <>
            <Link to={`/doll-bodies/${dollBody.id}/edit`}>
              <Button.Root variant='secondary' className='w-[130px]'>
                Edit
              </Button.Root>
            </Link>
          </>
        </div>
        {/* TODO: How is this gonna work? */}
        <div className='md:hidden flex'>
          <Icons.more />
        </div>
      </div>
      <div className='flex sm:flex-row flex-col-reverse md:gap-0 sm:gap-8 sm:flex-1 sm:divide-x divide-neutral-04 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl pb-2.5'>
        
        <div className='sm:pr-4 flex size-full'>
          <div className='sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl p-5 flex flex-col gap-5 flex-1 h-max text-body-md text-base-black'>
            <div className='flex items-center justify-between'>
              <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Description</h3>
            </div>
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>
        </div>



        <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
          <div className='relative'>
            <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'>
              {picture ? (
                <div className='size-full'>
                  <img
                    src={getPicture(dollBody, 'dollBodies', false)}
                    srcSet={getPicture(dollBody, 'dollBodies', true)}
                    alt={name}
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
    </div>
  );
}
