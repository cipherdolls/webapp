import { Link, useRouteLoaderData } from 'react-router';
import * as Accordion from '@radix-ui/react-accordion';
import * as Button from '~/components/ui/button/button';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { getPicture } from '~/utils/getPicture';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import { formatModelName } from '~/utils/formatModelName';
import Tooltip from '~/components/ui/tooltip';
import { Icons } from '~/components/ui/icons';
import type { User } from '~/types';

type ChatModel = {
  id: string;
  providerModelName: string;
  contextWindow: number;
  dollarPerInputToken: number;
  dollarPerOutputToken: number;
  recommended: boolean;
  censored: boolean;
  error?: string;
  info?: string;
  aiProvider?: {
    id: string;
    name: string;
  };
  aggregateChatCompletions?: {
    avgTimeTakenMs: number;
  };
};

type ChatModelItemProps = {
  chatModel: ChatModel;
};

export function ChatModelItem({ chatModel }: ChatModelItemProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  return (
    <Accordion.Item key={chatModel.id} value={chatModel.id} className='bg-white rounded-xl shadow-bottom-level-1 overflow-hidden'>
      <div className='relative'>
        <Accordion.Trigger className='group flex w-full items-center justify-between p-5 text-left hover:bg-neutral-05 transition-colors'>
          <div className='flex items-center gap-3 flex-1'>
            {/* Provider Icon */}
            {chatModel.aiProvider && (
              <div className='size-8 flex-shrink-0'>
                <img
                  src={getPicture(chatModel.aiProvider, 'ai-providers', false)}
                  alt={chatModel.aiProvider.name}
                  className='size-full object-cover rounded-lg'
                  loading='lazy'
                />
              </div>
            )}

            {/* Model Info */}
            <div className='flex flex-col flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                {chatModel.error && (
                  <Tooltip
                    side={'top'}
                    trigger={<Icons.warning className='size-4 text-specials-danger flex-shrink-0' />}
                    content={chatModel.error}
                    popoverClassName='max-w-[350px]'
                  />
                )}
                <span className='font-semibold text-lg text-base-black truncate'>{formatModelName(chatModel.providerModelName)}</span>
                <RecommendedBadge recommended={chatModel.recommended} tooltipText='Recommended' />
              </div>

              {chatModel.aiProvider && <span className='text-sm text-neutral-01'>{chatModel.aiProvider.name}</span>}
            </div>

            {/* Quick Stats */}
            <div className='hidden sm:flex items-center gap-6 text-sm text-neutral-01'>
              <div className='text-center'>
                <div className='font-medium text-base-black'>{chatModel.contextWindow.toLocaleString()}</div>
                <div>Context</div>
              </div>
              <div className='text-center'>
                <div className='font-medium text-base-black'>${scientificNumConvert(chatModel.dollarPerInputToken * 1000000)}</div>
                <div>Input</div>
              </div>
              <div className='text-center'>
                <div className='font-medium text-base-black'>${scientificNumConvert(chatModel.dollarPerOutputToken * 1000000)}</div>
                <div>Output</div>
              </div>
            </div>
          </div>

          <Icons.chevronDown className='size-5 text-neutral-01 transition-transform duration-200 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0' />
        </Accordion.Trigger>
      </div>

      <Accordion.Content className='overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up'>
        <div className='px-5 pb-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-04'>
            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Context Window</label>
              <div className='text-base font-semibold text-base-black'>{chatModel.contextWindow.toLocaleString()} tokens</div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Input Cost</label>
              <div className='text-base font-semibold text-base-black'>
                ${scientificNumConvert(chatModel.dollarPerInputToken * 1000000)}/1M tokens
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Output Cost</label>
              <div className='text-base font-semibold text-base-black'>
                ${scientificNumConvert(chatModel.dollarPerOutputToken * 1000000)}/1M tokens
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium text-neutral-01'>Average Response Time</label>
              <div className='text-base font-semibold text-base-black'>{chatModel.aggregateChatCompletions?.avgTimeTakenMs || '--'} ms</div>
            </div>

            {chatModel.info && (
              <div className='space-y-1 sm:col-span-2 lg:col-span-4'>
                <label className='text-sm font-medium text-neutral-01'>Additional Info</label>
                <div className='text-sm text-base-black bg-neutral-05 p-3 rounded-lg'>{chatModel.info}</div>
              </div>
            )}

            <div className='space-y-1 sm:col-span-2 lg:col-span-4'>
              <label className='text-sm font-medium text-neutral-01'>Features</label>
              <div className='flex flex-wrap gap-2'>
                {chatModel.recommended && (
                  <span className='px-2 py-1 bg-gradient-1 text-base-black text-xs font-medium rounded-full'>Recommended</span>
                )}
                {chatModel.censored && (
                  <span className='px-2 py-1 bg-neutral-04 text-neutral-01 text-xs font-medium rounded-full'>Censored</span>
                )}
                {!chatModel.censored && (
                  <span className='px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>Uncensored</span>
                )}
              </div>
            </div>

            {/* Actions */}
            {me && me.role === 'ADMIN' && (
              <div className='sm:col-span-2 lg:col-span-4 pt-4 border-t border-neutral-04'>
                <div className='flex gap-3'>
                  <Button.Root asChild variant='primary' size='sm' className='px-4'>
                    <Link to={`/chat-models/${chatModel.id}/edit`}>Edit</Link>
                  </Button.Root>
                  <Button.Root asChild variant='danger' size='sm' className='px-4'>
                    <Link to={`/chat-models/${chatModel.id}/delete`}>
                      <Button.Icon as={Icons.trash} />
                      Delete
                    </Link>
                  </Button.Root>
                </div>
              </div>
            )}
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
