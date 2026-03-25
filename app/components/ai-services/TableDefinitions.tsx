import type { ChatModel, EmbeddingModel } from '~/types';
import type { TTableColumn } from '~/components/Table';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatModelName } from '~/utils/formatModelName';
import { ViewButton } from '~/components/preferencesViewButton';
import { UncensoredBadge } from '~/components/ui/UncensoredBadge';
import { Icons } from '~/components/ui/icons';
import Tooltip from '~/components/ui/tooltip';
import { ROUTES } from '~/constants';

export const chatModelColumns: Array<TTableColumn<ChatModel>> = [
  {
    id: 'providerModelName',
    label: 'Chat model',
    render: (data) => (
      <span className='font-semibold text-body-md flex items-center gap-2'>
        {formatModelName(data.providerModelName)}
        {data.free && <span className='text-green-600 text-xs font-medium'>free</span>}
        {!data.error && <UncensoredBadge censored={data.censored} />}
        {data.error && (
          <Tooltip
            side='top'
            variant='error'
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            className='max-w-[350px]'
          />
        )}
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'contextWindow',
    label: 'Context Window',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.contextWindow ? `${(data.contextWindow / 1000).toFixed(0)}k` : '-'}</span>,
    align: 'right',
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
        {formatModelName(data.providerModelName)}
        {data.error && (
          <Tooltip
            side='top'
            variant='error'
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            className='max-w-[350px]'
          />
        )}
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'contextWindow',
    label: 'Context Window',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.contextWindow ? `${(data.contextWindow / 1000).toFixed(0)}k` : '-'}</span>,
    align: 'right',
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
        {formatModelName(data.providerModelName)}
        {data.free && <span className='text-green-600 text-xs font-medium'>free</span>}
        {!data.error && <UncensoredBadge censored={data.censored} />}
        {data.error && (
          <Tooltip
            side='top'
            variant='error'
            trigger={<Icons.warning className='size-4 text-specials-danger' />}
            content={data.error}
            className='max-w-[350px]'
          />
        )}
      </span>
    ),
    align: 'left',
    className: 'min-w-[220px] max-w-[280px]',
  },
  {
    id: 'contextWindow',
    label: 'Context Window',
    render: (data) => <span className='text-body-sm text-neutral-01'>{data.contextWindow ? `${(data.contextWindow / 1000).toFixed(0)}k` : '-'}</span>,
    align: 'right',
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
