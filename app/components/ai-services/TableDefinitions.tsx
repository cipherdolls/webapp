import type { ChatModel, EmbeddingModel } from '~/types';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatModelName } from '~/utils/formatModelName';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { ViewButton } from '~/components/preferencesViewButton';
import { Icons } from '~/components/ui/icons';
import Tooltip from '~/components/ui/tooltip';
import { ROUTES } from '~/constants';

export const chatModelColumns: Array<TTableColumn<ChatModel>> = [
  {
    id: 'providerModelName',
    label: 'Chat model',
    render: (data) => (
      <span className='font-semibold text-body-md flex items-center gap-2'>
        {data.error && (
          <Tooltip
            side={'top'}
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            popoverClassName='max-w-[350px]'
          />
        )}
        {formatModelName(data.providerModelName)}
        <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'aiProviderId',
    label: '',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
    align: 'left',
  },
  {
    id: 'dollarPerInputToken',
    label: 'Input',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'The cost of processing one million tokens that you send to the model',
  },
  {
    id: 'dollarPerOutputToken',
    label: 'Output',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'Cost 1 unit of the token you received at the same rate',
  },
  {
    id: 'id',
    label: '',
    render: (data) => (
      <ViewButton
        popoverItems={[
          { text: 'Edit', href: `${ROUTES.services}/ai/chat-models/${data.id}/edit` },
          { text: 'Delete', href: `${ROUTES.services}/ai/chat-models/${data.id}/delete`, isDelete: true },
        ]}
        className='flex items-center justify-center'
        isDataCard={true}
      />
    ),
    width: '44px',
    align: 'right',
  },
];

export const embeddingModelColumns: Array<TTableColumn<EmbeddingModel>> = [
  {
    id: 'providerModelName',
    label: 'Embedding model',
    render: (data) => (
      <span className='font-semibold text-body-md flex items-center gap-2'>
        {data.error && (
          <Tooltip
            side={'top'}
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            className='max-w-[350px]'
          />
        )}
        {formatModelName(data.providerModelName)}
        <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'aiProviderId',
    label: '',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
    align: 'left',
  },
  {
    id: 'dollarPerInputToken',
    label: 'Input',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'The cost of processing one million tokens that you send to the model',
  },
  {
    id: 'dollarPerOutputToken',
    label: 'Output',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'Cost 1 unit of the token you received at the same rate',
  },
  {
    id: 'id',
    label: '',
    render: (data) => (
      <ViewButton
        popoverItems={[
          { text: 'Edit', href: `${ROUTES.services}/ai/embedding-models/${data.id}/edit` },
          { text: 'Delete', href: `${ROUTES.services}/ai/embedding-models/${data.id}/delete`, isDelete: true },
        ]}
        className='flex items-center justify-center'
        isDataCard={true}
      />
    ),
    width: '44px',
    align: 'right',
  },
];

export const reasoningModelColumns: Array<TTableColumn<ChatModel>> = [
  {
    id: 'providerModelName',
    label: 'Reasoning model',
    render: (data) => (
      <span className='font-semibold text-body-md flex items-center gap-2'>
        {data.error && (
          <Tooltip
            side={'top'}
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            className='max-w-[350px]'
          />
        )}
        {formatModelName(data.providerModelName)}
        <RecommendedBadge recommended={data.recommended} tooltipText='Recommended' />
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'aiProviderId',
    label: '',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.info}</span>,
    align: 'left',
  },
  {
    id: 'dollarPerInputToken',
    label: 'Input',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerInputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'The cost of processing one million tokens that you send to the model',
  },
  {
    id: 'dollarPerOutputToken',
    label: 'Output',
    render: (data) => <span className='text-sm'>${scientificNumConvert(data.dollarPerOutputToken * 1000000)}</span>,
    align: 'right',
    width: '104px',
    tooltipText: 'Cost 1 unit of the token you received at the same rate',
  },
  {
    id: 'id',
    label: '',
    render: (data) => (
      <ViewButton
        popoverItems={[
          { text: 'Edit', href: `${ROUTES.services}/ai/reasoning-models/${data.id}/edit` },
          { text: 'Delete', href: `${ROUTES.services}/ai/reasoning-models/${data.id}/delete`, isDelete: true },
        ]}
        className='flex items-center justify-center'
        isDataCard={true}
      />
    ),
    width: '44px',
    align: 'right',
  },
];