import { Link, Outlet } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId';
import { getPicture } from '~/utils/getPicture';
import * as Checkbox from '@radix-ui/react-checkbox';
import DeleteAvatarModal from '~/components/deleteAvatarModal';
import DeleteModal from '~/components/ui/deleteModal';
import ChatModelDestroy from './chat-models.$id.destroy';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`chat-models/${params.id}`);
  return await res.json();
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const chatModel: ChatModel = loaderData;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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
          <Link to={`/ai-providers/${chatModel.aiProviderId}`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-md font-semibold text-base-black hover:underline transition-all duration-200'>
              Go back to <span className='text-neutral-01 text-body-lg'>{chatModel.aiProvider?.name}</span>
            </h3>
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
          {/* TODO: How is this gonna work? */}
          <div className='md:hidden flex'>
            <Icons.more />
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 border-b border-neutral-03 pb-4'>
            <div className='flex items-center sm:gap-5 gap-1'>
              <div className='size-32'>
                <img
                  src={getPicture(chatModel.aiProvider, 'ai-providers', false)}
                  srcSet={getPicture(chatModel.aiProvider, 'ai-providers', true)}
                  alt={chatModel.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>
              <div className='flex flex-1 items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{chatModel.name}</h3>
                  <p className='text-neutral-01'>{chatModel.providerModelName}</p>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Provider:</span>
                    <Link to={`/ai-providers/${chatModel.aiProviderId}`} className='text-base-black hover:underline font-medium'>
                      {chatModel.aiProvider?.name}
                    </Link>
                  </div>
                </div>
                <div className='lg:flex hidden flex-col justify-between gap-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col items-center justify-center gap-1'>
                      <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                        Recommended
                      </label>
                      {chatModel.recommended ? (
                        <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                          <Icons.check className='text-white size-4.5' />
                        </div>
                      ) : (
                        <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                          <Icons.close className='text-white size-4.5' />
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col items-center justify-center gap-1'>
                      <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                        Censored
                      </label>
                      {chatModel.censored ? (
                        <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                          <Icons.check className='text-white size-4.5' />
                        </div>
                      ) : (
                        <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                          <Icons.close className='text-white size-4.5' />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-sm text-neutral-01'>
                      Created at: <span className='text-body-md text-base-black/80 font-medium'>{createdDate}</span>
                    </p>
                    <p className='text-body-sm text-neutral-01'>
                      Updated at: <span className='text-body-md text-base-black/80 font-medium'>{updatedDate}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex lg:hidden flex-col justify-between gap-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col items-center justify-center gap-1'>
                  <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                    Recommended
                  </label>
                  {chatModel.recommended ? (
                    <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                      <Icons.check className='text-white size-4.5' />
                    </div>
                  ) : (
                    <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                      <Icons.close className='text-white size-4.5' />
                    </div>
                  )}
                </div>
                <div className='flex flex-col items-center justify-center gap-1'>
                  <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                    Censored
                  </label>
                  {chatModel.censored ? (
                    <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                      <Icons.check className='text-white size-4.5' />
                    </div>
                  ) : (
                    <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                      <Icons.close className='text-white size-4.5' />
                    </div>
                  )}
                </div>
              </div>
              <div className='flex flex-col gap-1'>
                <p className='text-body-sm text-neutral-01'>
                  Created at: <span className='text-body-md text-base-black/80 font-medium'>{createdDate}</span>
                </p>
                <p className='text-body-sm text-neutral-01'>
                  Updated at: <span className='text-body-md text-base-black/80 font-medium'>{updatedDate}</span>
                </p>
              </div>
            </div>
          </div>
          <div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4'>
            <div className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Model Properties</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Context Window:</span>
                  <span className='font-medium'>{chatModel.contextWindow.toLocaleString()} token</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Dollar Per Input Token: </span>
                  <span className='font-medium'>${chatModel.dollarPerInputToken}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Dollar Per Output Token:</span>
                  <span className='font-medium'>${chatModel.dollarPerOutputToken}</span>
                </div>
              </div>
            </div>
            <div className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Performance Stats</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Average Response Time:</span>
                  <span className='font-medium'>{formatResponseTime(chatModel.aggregateChatCompletions.avgTimeTakenMs)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600'>Min Response Time:</span>
                  <span className='font-medium'>{formatResponseTime(chatModel.aggregateChatCompletions.minTimeTakenMs)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600'>Max Response Time:</span>
                  <span className='font-medium'>{formatResponseTime(chatModel.aggregateChatCompletions.maxTimeTakenMs)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-gray-600'>Average Cost:</span>
                  <span className='font-medium'>${chatModel.aggregateChatCompletions.avgUsdCost || '0.00'}</span>
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
