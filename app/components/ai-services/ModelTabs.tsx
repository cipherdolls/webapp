import type { ChatModel, EmbeddingModel, ChatModelsPaginated, meta } from '~/types';
import { UniversalModelTab } from './UniversalModelTab';

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
  // Use the same universal component for all tabs to ensure consistent hook calls
  const tabs = [
    {
      id: 'chat-models',
      label: 'Chat Models',
      content: <UniversalModelTab key="chat-models" tabType="chat-models" initialData={chatModelsPaginated} />,
    },
    {
      id: 'embedding-models',
      label: 'Embedding Models',
      content: <UniversalModelTab key="embedding-models" tabType="embedding-models" initialData={embeddingModelsPaginated} />,
    },
    {
      id: 'reasoning-models',
      label: 'Reasoning Models',
      content: <UniversalModelTab key="reasoning-models" tabType="reasoning-models" initialData={reasoningModelsPaginated} />,
    },
  ];

  return tabs;
}

export type { EmbeddingModelsPaginated, ReasoningModelsPaginated };