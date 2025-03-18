import { Link, Outlet, redirect, useFetcher, useParams } from 'react-router';
import { Icons } from '~/components/ui/icons';
import { Fragment } from 'react';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, ChatModel, EmbeddingModel } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { DataCard } from '~/components/DataCard';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import DeleteAiProviderModal from '~/components/deleteAiProviderModal';

const columnProperties: Array<TTableColumn<ChatModel | EmbeddingModel>> = [
  {
    id: 'name',
    label: 'Name',
    render: (data) => <span className='font-semibold'>{data.name}</span>,
    align: 'left',
  },
  {
    id: 'dollarPerInputToken',
    label: 'Output',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken)}</span>,
    align: 'right',
  },
  {
    id: 'dollarPerOutputToken',
    label: 'Output',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken)}</span>,
    align: 'right',
  },
  {
    id: 'id',
    label: '',
    render: (data) => {
      const isEmbeddingModel = !('censored' in data);
      const modelType = isEmbeddingModel ? 'embedding-model' : 'chat-model';
      const { aiProviderId } = useParams();
      const providerId = isEmbeddingModel ? aiProviderId : data.aiProviderId;

      return (
        <Link to={`/ai-providers/${providerId}/${modelType}/${data.id}/edit`} className='hover:opacity-50 transition-colors'>
          <Icons.pen />
        </Link>
      );
    },
    align: 'right',
  },
];

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Ai Providers' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const aiProviderId = params.aiProviderId;
  const res = await fetchWithAuth(`ai-providers/${aiProviderId}`);
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const aiProviderId = formData.get('aiProviderId');

    const res = await fetchWithAuth(`aiProviders/${aiProviderId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const aiProvider: AiProvider = await res.json();
    return redirect(`/ai-providers/${aiProvider.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const aiProvider: AiProvider = loaderData;
  const { chatModels, embeddingModels } = aiProvider;
  const fetcher = useFetcher();
  const AddModelIcon = ({ to }: { to: string }) => {
    return (
      <Link to={to}>
        <Icons.add />
      </Link>
    );
  };

  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <div className='flex items-center gap-3 sm:gap-4'>
          <Link to={'/preferences/ai'} className='hover:bg-white/40 rounded-full'>
            <Icons.chevronLeft />
          </Link>
          <div className='flex items-center  sm:gap-3 gap-1'>
            <div className='w-full h-10'>
              <img
                src={getPicture(aiProvider, 'ai-providers', false)}
                srcSet={getPicture(aiProvider, 'ai-providers', true)}
                alt={aiProvider.name}
                className='size-full object-cover rounded-lg'
              />
            </div>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{aiProvider.name}</h3>
          </div>
        </div>
        <div className='md:flex hidden items-center gap-3'>
          <Link to={`/ai-providers/${aiProvider.id}/edit`}>
            <Button.Root variant='secondary' className='w-[130px]'>
              Edit
            </Button.Root>
          </Link>
          <DeleteAiProviderModal />
        </div>
        <div className='md:hidden flex'>
          <Icons.more />
        </div>
      </div>
      <div className='flex flex-col gap-10 pb-5'>
        <div className='flex flex-col gap-5'>
          <DataCard.Root>
            <DataCard.Label
              className='text-2xl font-semibold'
              extra={<AddModelIcon to={`/ai-providers/${aiProvider.id}/chat-models/new`} />}
            >
              Chat Models
            </DataCard.Label>

            <DataCard.Wrapper>
              {chatModels.length > 0 ? (
                <>
                  {/* DESKTOP TABLE */}
                  <Table columns={columnProperties} data={[...chatModels]} wrapperClassName='hidden md:block' />

                  {/* MOBILE CARD */}
                  {chatModels.map((chatModel, index) => {
                    return (
                      <Fragment key={chatModel.id}>
                        <DataCard.Item key={chatModel.id} collapsible className='block md:hidden'>
                          <DataCard.ItemLabel>{chatModel.name}</DataCard.ItemLabel>
                          <DataCard.ItemCollapsibleContent>
                            <DataCard.ItemDataGrid
                              data={[
                                {
                                  label: 'Output',
                                  value: <>{scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                                },
                                {
                                  label: 'Average Time Taken',
                                  value: '1153 ms',
                                },
                              ]}
                              variant='secondary'
                            />
                          </DataCard.ItemCollapsibleContent>
                          <DataCard.ItemDataGrid
                            data={[
                              {
                                label: '$/Input',
                                value: <>${scientificNumConvert(chatModel.dollarPerInputToken)}</>,
                              },
                              {
                                label: '$/Output',
                                value: <>${scientificNumConvert(chatModel.dollarPerOutputToken)}</>,
                              },
                            ]}
                          />
                        </DataCard.Item>
                        {chatModels.length - 1 !== index && <DataCard.Divider className='block md:hidden' />}
                      </Fragment>
                    );
                  })}
                </>
              ) : (
                <DataCard.Text>No chat models found</DataCard.Text>
              )}
            </DataCard.Wrapper>
          </DataCard.Root>
        </div>
        <div className='flex flex-col gap-5'>
          <DataCard.Root>
            <DataCard.Label
              className='text-2xl font-semibold'
              extra={<AddModelIcon to={`/ai-providers/${aiProvider.id}/embedding-models/new`} />}
            >
              Embedding Models
            </DataCard.Label>
            <DataCard.Wrapper>
              {embeddingModels.length > 0 ? (
                <>
                  {/* DESKTOP TABLE */}
                  <Table columns={columnProperties} data={[...embeddingModels]} wrapperClassName='hidden md:block' />

                  {/* MOBILE CARD */}
                  {embeddingModels.map((embeddingModel, index) => {
                    return (
                      <Fragment key={embeddingModel.id}>
                        <DataCard.Item key={embeddingModel.id} collapsible className='block md:hidden'>
                          <DataCard.ItemLabel>{embeddingModel.name}</DataCard.ItemLabel>
                          <DataCard.ItemCollapsibleContent>
                            <DataCard.ItemDataGrid
                              data={[
                                {
                                  label: 'Output',
                                  value: <>{scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                                },
                                {
                                  label: 'Average Time Taken',
                                  value: '1153 ms',
                                },
                              ]}
                              variant='secondary'
                            />
                          </DataCard.ItemCollapsibleContent>
                          <DataCard.ItemDataGrid
                            data={[
                              {
                                label: '$/Input',
                                value: <>${scientificNumConvert(embeddingModel.dollarPerInputToken)}</>,
                              },
                              {
                                label: '$/Output',
                                value: <>${scientificNumConvert(embeddingModel.dollarPerOutputToken)}</>,
                              },
                            ]}
                          />
                        </DataCard.Item>
                        {embeddingModels.length - 1 !== index && <DataCard.Divider className='block md:hidden' />}
                      </Fragment>
                    );
                  })}
                </>
              ) : (
                <DataCard.Text>No embedding models found</DataCard.Text>
              )}
            </DataCard.Wrapper>
          </DataCard.Root>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
