import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.$scenariosId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Link, Outlet, useFetcher, useRouteLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { getPicture } from '~/utils/getPicture';
import type { Scenario, User } from '~/types';
import DeleteModal from '~/components/ui/deleteModal';
import ScenarioDestroy from './scenarios.$scenariosId.destroy';
import { formatModelName } from '~/utils/formatModelName';
import DetailCard from '~/components/ui/detail/detail-card';
import DetailRow from '~/components/ui/detail/detail-row';
import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { ViewMore } from '~/view-more';
import * as Accordion from '@radix-ui/react-accordion';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatDate } from '~/utils/date.utils';

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
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
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
        <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-5 sm:flex-1 sm:divide-x divide-neutral-04 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl pb-2.5'>
          <div className='sm:pr-4 flex size-full flex-col gap-4'>
            <DetailCard title='System Message' copy={true} copyText={scenario.systemMessage} isScenario={true}>
              <ReactMarkdown>{scenario.systemMessage}</ReactMarkdown>
            </DetailCard>
          </div>
          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <div className='relative'>
              <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl relative'>
                {scenario.picture ? (
                  <div className='size-full'>
                    <img
                      src={getPicture(scenario, 'avatars', false)}
                      srcSet={getPicture(scenario, 'avatars', true)}
                      alt={scenario.name}
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
            <DetailCard isScenario title='Chat Model Details' className='pb-3'>
              <div className='flex flex-col'>
                <div className='flex flex-col gap-4 pb-[18px]'>
                  <DetailRow title='Name' value={formatModelName(scenario.chatModel.providerModelName)} />
                  <DetailRow title='Context Window' value={`${formatNumberWithCommas(scenario.chatModel.contextWindow)} token`} />
                  <DetailRow title='Censored' value={scenario.chatModel.censored ? 'Yes' : 'No'} />
                  <DetailRow title='Recommended' value={scenario.chatModel.recommended ? 'Yes' : 'No'} />
                  <DetailRow
                    title='Input Token Cost'
                    value={`$${scientificNumConvert(scenario.chatModel.dollarPerInputToken * 1000000)}`}
                  />
                  <DetailRow
                    title='Output Token Cost'
                    value={`$${scientificNumConvert(scenario.chatModel.dollarPerOutputToken * 1000000)}`}
                  />
                </div>
                <Accordion.Root type='single' collapsible className='w-full'>
                  <Accordion.Item value='parameters'>
                    <Accordion.Trigger className='flex items-center justify-center w-full py-2 text-sm font-medium text-neutral-01 hover:text-base-black transition-colors group'>
                      <span className='group-data-[state=closed]:block group-data-[state=open]:hidden'>Show Details</span>
                      <span className='group-data-[state=closed]:hidden group-data-[state=open]:block'>Hide Details</span>
                      <Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                    </Accordion.Trigger>
                    <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                      <div className='flex flex-col gap-4 pt-[18px]'>
                        <DetailRow title='Temperature' value={scenario.temperature} />
                        <DetailRow title='TopP' value={scenario.topP} />
                        <DetailRow title='Frequency Penalty' value={scenario.frequencyPenalty} />
                        <DetailRow title='Presence Penalty' value={scenario.presencePenalty} />
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            </DetailCard>
            <DetailCard isScenario title='Embedding Model Details'>
              <div className='flex flex-col gap-4'>
                <DetailRow title='Name' value={formatModelName(scenario.embeddingModel.providerModelName)} />
                <DetailRow title='Recommended' value={scenario.embeddingModel.recommended ? 'Yes' : 'No'} />
                <DetailRow
                  title='Input Token Cost'
                  value={`$${scientificNumConvert(scenario.embeddingModel.dollarPerInputToken * 1000000)}`}
                />
                <DetailRow
                  title='Output Token Cost'
                  value={`$${scientificNumConvert(scenario.embeddingModel.dollarPerOutputToken * 1000000)}`}
                />
              </div>
            </DetailCard>
            <DetailCard isScenario title='Reasoning Model'>
              {scenario.reasoningModel ? (
                <div className='flex flex-col gap-4'>
                  <DetailRow title='Name' value={formatModelName(scenario.reasoningModel.providerModelName)} />
                  <DetailRow title='AI Provider ID' value={scenario.reasoningModel.aiProviderId} />
                  <DetailRow
                    title='Input Token Cost'
                    value={`$${scientificNumConvert(scenario.reasoningModel.dollarPerInputToken * 1000000)}`}
                  />
                  <DetailRow
                    title='Output Token Cost'
                    value={`$${scientificNumConvert(scenario.reasoningModel.dollarPerOutputToken * 1000000)}`}
                  />
                  <DetailRow title='Recommended' value={scenario.reasoningModel.recommended ? 'Yes' : 'No'} />
                </div>
              ) : (
                <p className='text-neutral-01 text-body-sm'>No reasoning model configured</p>
              )}
            </DetailCard>
            <DetailCard isScenario>
              <div className='flex flex-col gap-4'>
                <DetailRow title='Created at: ' value={createdDate} />
                <DetailRow title='Updated at:' value={updatedDate} />
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
