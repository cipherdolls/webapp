import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.$scenariosId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Link, Outlet, useNavigate } from 'react-router';

import { getPicture } from '~/utils/getPicture';
import type { Scenario } from '~/types';
import DeleteModal from '~/components/ui/deleteModal';
import ScenarioDestroy from './scenarios.$scenariosId.destroy';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenario Details' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const scenarioId = params.scenariosId;
  const res = await fetchWithAuth(`scenarios/${scenarioId}`);
  return await res.json();
}

export default function ScenariosId({ loaderData }: Route.ComponentProps) {
  const scenario = loaderData as Scenario;
  const navigate = useNavigate();

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

  const createdDate = formatDate(scenario.createdAt);
  const updatedDate = formatDate(scenario.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <button onClick={() => navigate(-1)} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-md font-semibold text-base-black hover:underline transition-all duration-200'>
              Go back to <span className='text-neutral-01 text-body-lg'>Scenarios</span>
            </h3>
          </button>
          <div className='md:flex hidden items-center gap-3'>
            <Link to={`/scenarios/${scenario.id}/edit`}>
              <Button.Root variant='secondary' className='w-[130px]'>
                Edit
              </Button.Root>
            </Link>
            <DeleteModal
              title='Delete a Scenario?'
              description='By deleting a scenario all related data will be deleted as well. You will not be able to restore the data.'
            >
              <ScenarioDestroy />
            </DeleteModal>
          </div>
          <div className='md:hidden flex'>
            <Icons.more />
          </div>
        </div>

        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 border-b border-neutral-03 pb-4'>
            <div className='flex items-center sm:gap-5 gap-1'>
              <div className='size-32'>
                <img
                  src={getPicture(scenario, 'scenarios', false)}
                  srcSet={getPicture(scenario, 'scenarios', true)}
                  alt={scenario.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>

              <div className='flex flex-1 items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{scenario.name}</h3>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Chat Model:</span>
                    <span className='text-base-black font-medium'>{scenario.chatModel.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Embedding Model:</span>
                    <span className='text-base-black font-medium'>{scenario.embeddingModel.name}</span>
                  </div>
                </div>

                <div className='lg:flex hidden flex-col justify-between gap-6'>
                  <div className='flex flex-col items-center justify-center gap-1'>
                    <label className='text-body-sm font-semibold text-neutral-01'>Recommended</label>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-neutral-01'>Chat Model:</span>
                        {scenario.chatModel.recommended ? (
                          <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                            <Icons.check className='text-white size-4.5' />
                          </div>
                        ) : (
                          <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                            <Icons.close className='text-white size-4.5' />
                          </div>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-neutral-01'>Embedding Model:</span>
                        {scenario.embeddingModel.recommended ? (
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

            <div className='flex lg:hidden flex-col justify-between gap-3'>
              <div className='flex flex-col gap-2 max-w-max'>
                <label className='text-body-sm font-semibold text-neutral-01'>Recommended</label>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-neutral-01'>Chat Model:</span>
                    {scenario.chatModel.recommended ? (
                      <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                        <Icons.check className='text-white size-4.5' />
                      </div>
                    ) : (
                      <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                        <Icons.close className='text-white size-4.5' />
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-neutral-01'>Embedding Model:</span>
                    {scenario.embeddingModel.recommended ? (
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
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>System Message</h2>
              <div className='whitespace-pre-wrap p-2 rounded-lg'>{scenario.systemMessage}</div>
            </div>

            <div className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Model Parameters</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Temperature:</span>
                  <span className='font-medium'>{scenario.temperature}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Top P:</span>
                  <span className='font-medium'>{scenario.topP}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Frequency Penalty:</span>
                  <span className='font-medium'>{scenario.frequencyPenalty}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Presence Penalty:</span>
                  <span className='font-medium'>{scenario.presencePenalty}</span>
                </div>
              </div>
            </div>

            <div className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Chat Model Details</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Name:</span>
                  <span className='font-medium'>{scenario.chatModel.name}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Provider Model:</span>
                  <span className='font-medium'>{scenario.chatModel.providerModelName}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Context Window:</span>
                  <span className='font-medium'>{scenario.chatModel.contextWindow.toLocaleString()} token</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Censored:</span>
                  <span className='font-medium'>{scenario.chatModel.censored ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Embedding Model Details</h2>

              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Name:</span>
                  <span className='font-medium'>{scenario.embeddingModel.name}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Provider Model:</span>
                  <span className='font-medium'>{scenario.embeddingModel.providerModelName}</span>
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
