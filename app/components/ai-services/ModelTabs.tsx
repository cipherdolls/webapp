import type { ChatModel, EmbeddingModel, ChatModelsPaginated, meta } from '~/types';
import { ChatModelsTab } from './ChatModelsTab';
import { EmbeddingModelsTab } from './EmbeddingModelsTab';
import { ReasoningModelsTab } from './ReasoningModelsTab';

type EmbeddingModelsPaginated = {
  data: EmbeddingModel[];
  meta: meta;
};

type ReasoningModelsPaginated = {
  data: ChatModel[];
  meta: meta;
};

type ModelTabsProps = {
  chatModelsPaginated: ChatModelsPaginated | null;
  embeddingModelsPaginated: EmbeddingModelsPaginated | null;
  reasoningModelsPaginated: ReasoningModelsPaginated | null;
};

export function ModelTabs({ 
  chatModelsPaginated, 
  embeddingModelsPaginated, 
  reasoningModelsPaginated 
}: ModelTabsProps) {
  const tabs = [
    {
      id: 'chat-models',
      label: 'Chat Models',
      content: <ChatModelsTab initialData={chatModelsPaginated} />,
    },
    {
      id: 'embedding-models',
      label: 'Embedding Models',
      content: <EmbeddingModelsTab initialData={embeddingModelsPaginated} />,
    },
    {
      id: 'reasoning-models',
      label: 'Reasoning Models',
      content: <ReasoningModelsTab initialData={reasoningModelsPaginated} />,
    },
  ];

  return tabs;
}

export type { EmbeddingModelsPaginated, ReasoningModelsPaginated };