import { useState } from 'react';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import { motion } from 'framer-motion';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemMessage: string;
  scenarioName: string;
  trigger?: React.ReactNode;
  isLoadingSystemPrompt?: boolean;
  isSystemPromptAvailable?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  systemMessage,
  scenarioName,
  trigger,
  isLoadingSystemPrompt = false,
  isSystemPromptAvailable = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(systemMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const content = (
    <Modal.Content className={cn('flex flex-col justify-between max-w-[680px]', isExpanded && 'max-w-none w-[90vw] h-screen')}>
      <div>
        <div className='flex items-center justify-between'>
          <Modal.Title>System Prompt</Modal.Title>

          <div className='flex items-center gap-1'>
            {onRefresh && (
              <motion.button
                type='button'
                transition={{ duration: 1 }}
                animate={isRefreshing ? { transform: 'rotate(-360deg)' } : undefined}
                onClick={onRefresh}
                disabled={isRefreshing}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
                title='Refresh system prompt'
              >
                <Icons.refresh className='w-5 h-5' />
              </motion.button>
            )}
            <button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
              title={isExpanded ? 'Collapse modal' : 'Expand modal'}
            >
              <Icons.expand />
            </button>
          </div>
        </div>

        <Modal.Description className='mt-2 text-body-md text-neutral-01'>
          Scenario: <span className='font-semibold text-base-black'>{scenarioName}</span>
        </Modal.Description>
      </div>

      <Modal.Body className='mt-6 flex flex-col flex-1'>
        {isLoadingSystemPrompt ? (
          <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
            <div className='flex gap-2 items-center'>
              <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
              <p className='text-body-sm text-blue-800'>Loading chat system prompt...</p>
            </div>
          </div>
        ) : !isSystemPromptAvailable ? (
          <div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
            <div className='flex gap-2 items-start'>
              <Icons.info className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
              <div className='text-body-sm text-amber-800'>
                <p className='font-semibold mb-1'>Chat System Prompt Not Available</p>
                <p>
                  This chat hasn't been activated yet. The system prompt shown below is from the scenario template. To load the actual chat
                  system prompt, send a message in this chat first.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className='relative h-full'>
          <textarea
            readOnly
            value={systemMessage}
            className={cn(
              'w-full min-h-[300px] max-h-[400px] p-4',
              'border border-neutral-04 rounded-xl',
              'bg-neutral-05 text-base-black text-body-md',
              'font-mono leading-relaxed',
              'resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'scrollbar-medium',
              isExpanded && 'h-full !max-h-[70vh]'
            )}
            aria-label='System prompt message'
          />
        </div>

        <p className='mt-3 text-body-sm text-neutral-01'>
          {isSystemPromptAvailable
            ? 'This is the active system prompt for this chat conversation.'
            : 'This is the system message sent to the AI model to define its behavior and context.'}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Modal.Close asChild>
          <Button.Root variant='secondary' className='flex-1' onClick={onClose}>
            Close
          </Button.Root>
        </Modal.Close>
        <Button.Root variant='primary' className='flex-1 gap-2' onClick={handleCopy} disabled={copied}>
          {copied ? (
            <>
              <Icons.copied className='w-5 h-5' />
              Copied!
            </>
          ) : (
            <>
              <Icons.copy className='w-5 h-5' />
              Copy
            </>
          )}
        </Button.Root>
      </Modal.Footer>
    </Modal.Content>
  );

  if (trigger) {
    return (
      <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Modal.Trigger asChild>{trigger}</Modal.Trigger>
        {content}
      </Modal.Root>
    );
  }

  return (
    <Modal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {content}
    </Modal.Root>
  );
};

export default SystemPromptModal;
