import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.$scenariosId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Link, Outlet, useFetcher, useRouteLoaderData } from 'react-router';

import { getPicture } from '~/utils/getPicture';
import type { Scenario, User } from '~/types';
import DeleteModal from '~/components/ui/deleteModal';
import ScenarioDestroy from './scenarios.$scenariosId.destroy';
import { formatDate } from '~/utils/date.utils';
import { formatModelName } from '~/utils/formatModelName';
import DetailCard from '~/components/ui/detail/detail-card';
import DetailRow from '~/components/ui/detail/detail-row';
import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { ViewMore } from '~/view-more';

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
  const fetcher = useFetcher();
  const me = useRouteLoaderData('routes/_main') as User;

  const createdDate = formatDate(scenario.createdAt);
  const updatedDate = formatDate(scenario.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5 gap-5'>
          <Link to={`/community/scenarios`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3 break-all'>
              <h3 className='text-heading-h3 font-semibold text-base-black hover:underline transition-all duration-200 line-clamp-2'>
                {formatModelName(scenario.name)}
              </h3>
              <span className='text-neutral-01 word text-body-lg'>•</span>
              <span className='text-neutral-01 text-body-lg shrink-0'>Scenarios</span>
            </div>
          </Link>
          <div className='md:flex hidden items-center gap-3'>
            <fetcher.Form method='POST' action='/community/scenarios/new'>
              <input hidden readOnly name='name' defaultValue={`${scenario.name} copy`} />
              <input hidden readOnly name='systemMessage' defaultValue={scenario.systemMessage} />
              <input hidden readOnly name='chatModelId' defaultValue={scenario.chatModel.id} />
              <input hidden readOnly name='embeddingModelId' defaultValue={scenario.embeddingModel.id} />
              <input hidden readOnly name='temperature' defaultValue={scenario.temperature} />
              <input hidden readOnly name='topP' defaultValue={scenario.topP} />
              <input hidden readOnly name='frequencyPenalty' defaultValue={scenario.frequencyPenalty} />
              <input hidden readOnly name='presencePenalty' defaultValue={scenario.presencePenalty} />
              <Button.Root variant='secondary' className='w-[130px]' type='submit'>
                Duplicate
              </Button.Root>
            </fetcher.Form>
            {me.id === scenario.userId && (
              <>
                <Link to={`/scenarios/${scenario.id}/edit`}>
                  <Button.Root variant='secondary' className='w-[130px]'>
                    Edit
                  </Button.Root>
                </Link>
                <DeleteModal title={`Delete scenario ${scenario.name}?`} description='You will not be able to restore the data.'>
                  <ScenarioDestroy />
                </DeleteModal>
              </>
            )}
          </div>
          <div className='md:hidden flex text-base-black'>
            <ViewMore
              userId={scenario.userId}
              popoverItems={[
                {
                  type: 'form',
                  text: 'Duplicate',
                  action: '/community/scenarios/new',
                  method: 'POST',
                  formData: {
                    name: `${scenario.name} copy`,
                    systemMessage: scenario.systemMessage,
                    chatModelId: scenario.chatModel.id,
                    embeddingModelId: scenario.embeddingModel.id,
                    temperature: scenario.temperature.toString(),
                    topP: scenario.topP.toString(),
                    frequencyPenalty: scenario.frequencyPenalty.toString(),
                    presencePenalty: scenario.presencePenalty.toString(),
                  },
                },
                {
                  type: 'link',
                  text: 'Edit',
                  href: `/scenarios/${scenario.id}/edit`,
                  visible: me.id === scenario.userId,
                },
                {
                  type: 'component',
                  text: 'Delete',
                  isDelete: true,
                  component: (
                    <DeleteModal
                      dropdown
                      title={`Delete scenario ${scenario.name}?`}
                      description='You will not be able to restore the data.'
                    >
                      <ScenarioDestroy />
                    </DeleteModal>
                  ),
                  visible: me.id === scenario.userId,
                },
              ]}
            />
          </div>
        </div>

        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl '>
            <div className='flex sm:gap-5 md:gap-10 gap-5 sm:justify-center sm:items-center md:items-end md:justify-between md:flex-row flex-col'>
              <div className='flex sm:items-center gap-5 s'>
                <div className='size-24 shrink-0'>
                  <img
                    src={getPicture(scenario, 'scenarios', false)}
                    srcSet={getPicture(scenario, 'scenarios', true)}
                    alt={scenario.name}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <h4 className='text-body-sm font-semibold sm:text-heading-h4 text-base-black break-all line-clamp-2'>{scenario.name}</h4>

                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-1'>
                      <div className='flex items-center gap-1'>
                        {scenario.embeddingModel.recommended ? (
                          <Icons.checkCircle className='size-4' />
                        ) : (
                          <Icons.warning className='size-4 text-specials-danger' />
                        )}
                        <span className='text-neutral-01 text-body-sm'>Embedding model •</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        {scenario.chatModel.recommended ? (
                          <Icons.checkCircle className='size-4' />
                        ) : (
                          <Icons.warning className='size-4 text-specials-danger' />
                        )}
                        <span className='text-neutral-01 text-body-sm'>Chat model</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='text-body-sm text-neutral-01'>Chat Model</span>
                      <span className='text-body-sm font-semibold text-base-black'>
                        {formatModelName(scenario.chatModel.providerModelName)}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <span className='text-body-sm text-neutral-01'>Embedding Model</span>
                      <span className='text-body-sm font-semibold text-base-black'>
                        {formatModelName(scenario.embeddingModel.providerModelName)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-1 sm:justify-end sm:items-end h-full'>
                <div className='flex flex-col gap-2'>
                  <p className='text-body-sm text-neutral-01 md:text-right text-center'>
                    Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                  </p>
                  <p className='text-body-sm text-neutral-01 md:text-right text-center shrink-0'>
                    Updated at: <span className='text-base-black font-semibold '>{updatedDate}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4'>
            <div className='flex flex-col gap-4'>
              <DetailCard title='Chat Model Details'>
                <div className='flex flex-col divide-y divide-neutral-04'>
                  <div className='flex flex-col gap-4 pb-[18px]'>
                    <DetailRow title='Name' value={formatModelName(scenario.chatModel.providerModelName)} />
                    <DetailRow title='Context Window' value={`${formatNumberWithCommas(scenario.chatModel.contextWindow)} token`} />
                    <DetailRow title='Censored' value={scenario.chatModel.censored ? 'Yes' : 'No'} />
                  </div>
                  <div className='flex flex-col gap-4 pt-[18px]'>
                    <DetailRow title='Temperature' value={scenario.temperature} />
                    <DetailRow title='TopP' value={scenario.topP} />
                    <DetailRow title='Frequency Penalty' value={scenario.frequencyPenalty} />
                    <DetailRow title='Presence Penalty' value={scenario.presencePenalty} />
                  </div>
                </div>
              </DetailCard>

              <DetailCard title='Embedding Model Details'>
                <div className='flex flex-col gap-4'>
                  <DetailRow title='Name' value={formatModelName(scenario.embeddingModel.providerModelName)} />
                </div>
              </DetailCard>
            </div>
            <div className='flex flex-col gap-4'>
              <DetailCard title='Reasoning Model'>
                {scenario.reasoningModel ? (
                  <div className='flex flex-col gap-4'>
                    <DetailRow title='Name' value={formatModelName(scenario.reasoningModel.providerModelName)} />
                    <DetailRow title='AI Provider ID' value={scenario.reasoningModel.aiProviderId} />
                    <DetailRow title='Input Token Cost' value={`$${scenario.reasoningModel.dollarPerInputToken}`} />
                    <DetailRow title='Output Token Cost' value={`$${scenario.reasoningModel.dollarPerOutputToken}`} />
                    <DetailRow title='Recommended' value={scenario.reasoningModel.recommended ? 'Yes' : 'No'} />
                  </div>
                ) : (
                  <p className='text-neutral-01 text-body-sm'>No reasoning model configured</p>
                )}
              </DetailCard>
              <DetailCard title='System Message' copy={true} copyText={scenario.systemMessage}>
                <p className='break-all'>{scenario.systemMessage}</p>
              </DetailCard>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
