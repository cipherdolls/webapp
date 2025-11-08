import { useState } from 'react';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemMessage: string;
  scenarioName: string;
  trigger?: React.ReactNode;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose, systemMessage, scenarioName, trigger }) => {
  const [copied, setCopied] = useState(false);

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
    <Modal.Content className='max-w-[680px]'>
      <div className='flex items-center justify-between'>
        <Modal.Title>System Prompt</Modal.Title>
        <Modal.Close asChild>
          <button
            onClick={onClose}
            className='text-neutral-01 hover:text-base-black transition-colors'
            aria-label='Close'
          >
            <Icons.close className='w-7 h-7'/>
          </button>
        </Modal.Close>
      </div>

      <Modal.Description className='mt-2 text-body-md text-neutral-01'>
        Scenario: <span className='font-semibold text-base-black'>{scenarioName}</span>
      </Modal.Description>

      <Modal.Body className='mt-6'>
        <div className='relative'>
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
              'scrollbar-medium'
            )}
            aria-label='System prompt message'
          />
        </div>

        <p className='mt-3 text-body-sm text-neutral-01'>
          This is the system message sent to the AI model to define its behavior and context.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Modal.Close asChild>
          <Button.Root variant='secondary' className='flex-1' onClick={onClose}>
            Close
          </Button.Root>
        </Modal.Close>
        <Button.Root
          variant='primary'
          className='flex-1 gap-2'
          onClick={handleCopy}
          disabled={copied}
        >
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
