import { Link, Outlet } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId';
import { getPicture } from '~/utils/getPicture';
import DeleteModal from '~/components/ui/deleteModal';
import ChatModelDestroy from './chat-models.$id.destroy';
import { formatDate } from '~/utils/date.utils';
import { scientificNumConvert } from '~/utils/scientificNumConvert';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`chat-models/${params.id}`);
  return await res.json();
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const chatModel: ChatModel = loaderData;

  const createdDate = formatDate(chatModel.createdAt);
  const updatedDate = formatDate(chatModel.updatedAt);

  const formatResponseTime = (time: number | null | undefined) => {
    if (!time && time !== 0) return 'N/A';
    return `${time} ms`;
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/services/ai`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='text-heading-h3 font-semibold text-base-black hover:underline transition-all duration-200'>
                {chatModel.name}
              </h3>
              <span className='text-neutral-01 word text-body-lg'>•</span>
              <span className='text-neutral-01 text-body-lg'>AI</span>
            </div>
          </Link>
          <div className='md:flex hidden items-center gap-3'>
            <Link to={`/chat-models/${chatModel.id}/edit`}>
              <Button.Root variant='secondary' className='w-[130px]'>
                Edit
              </Button.Root>
            </Link>
            <DeleteModal
              title='Delete a Chat Model?'
              description='By deleting a chat model a chat will be deleted as well. You will no able to restore the data'
            >
              <ChatModelDestroy />
            </DeleteModal>
          </div>
          <div className='md:hidden flex text-base-black'>
            <Icons.more />
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl '>
            <div className='flex sm:gap-5 md:gap-10 gap-5 justify-center items-center md:items-start md:justify-between md:flex-row flex-col'>
              <div className='flex items-center gap-5'>
                <div className='size-[72px]'>
                  <img
                    src={getPicture(chatModel.aiProvider, 'ai-providers', false)}
                    srcSet={getPicture(chatModel.aiProvider, 'ai-providers', true)}
                    alt={chatModel.name}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <h4 className='text-body-sm font-semibold sm:text-heading-h4 text-base-black'>{chatModel.providerModelName}</h4>
                  <div className='flex items-center gap-1'>
                    {chatModel.recommended && (
                      <div className='flex items-center gap-1'>
                        <Icons.thumb className='size-4' />
                        <span className='text-neutral-01 text-body-sm'>Recommended •</span>
                      </div>
                    )}
                    {chatModel.censored && (
                      <div className='flex items-center gap-1'>
                        <Icons.warning className='size-4 text-specials-danger' />
                        <span className='text-neutral-01 text-body-sm'>Censored</span>
                      </div>
                    )}
                  </div>
                  <p className='text-body-sm text-base-black'>Ensures secure communication</p>
                </div>
              </div>
              <div className='flex flex-1 justify-end items-end h-full'>
                <div className='flex flex-col gap-2'>
                  <p className='md:text-right text-body-sm text-neutral-01 text-center'>
                    Provider: <span className='text-base-black font-semibold'>{chatModel.aiProvider?.name}</span>
                  </p>
                  <p className='text-body-sm text-neutral-01 md:text-right text-center'>
                    Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                  </p>
                  <p className='text-body-sm text-neutral-01 md:text-right text-center'>
                    Updated at: <span className='text-base-black font-semibold'>{updatedDate}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4'>
            <div className='bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max relative'>
              <h2 className='text-body-md font-semibold mb-4 text-gray-800'>Model Properties</h2>
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Context Window:</span>
                  <span className='text-body-sm font-semibold'>{chatModel.contextWindow.toLocaleString()} token</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Dollar Per Input Token: </span>
                  <span className='text-body-sm font-semibold'>${scientificNumConvert(chatModel.dollarPerInputToken * 1000000)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Dollar Per Output Token:</span>
                  <span className='text-body-sm font-semibold'>${scientificNumConvert(chatModel.dollarPerOutputToken * 1000000)}</span>
                </div>
              </div>
              <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-3'>Prices are per million token</span>
            </div>
            <div className='bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max'>
              <h2 className='text-body-md font-semibold mb-4 text-gray-800'>Performance Stats</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Average Response Time:</span>
                  <span className='text-body-sm font-semibold'>
                    {formatResponseTime(chatModel.aggregateChatCompletions.avgTimeTakenMs)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600'>Min Response Time:</span>
                  <span className='text-body-sm font-semibold'>
                    {formatResponseTime(chatModel.aggregateChatCompletions.minTimeTakenMs)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Max Response Time:</span>
                  <span className='text-body-sm font-semibold'>
                    {formatResponseTime(chatModel.aggregateChatCompletions.maxTimeTakenMs)}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Average Cost:</span>
                  <span className='text-body-sm font-semibold'>${chatModel.aggregateChatCompletions.avgUsdCost || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
