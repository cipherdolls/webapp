import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';
import type { Doll } from '~/types';

interface DollFormModalProps {
  doll: Doll;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onClose: () => void;
  errors?: Error | null;
}

const DollFormModal = ({ doll, onSubmit, isPending, onClose, errors }: DollFormModalProps) => {
  const handleClose = () => {
    onClose && onClose();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  }

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content className='overflow-y-auto flex flex-col scrollbar-medium max-h-[calc(100vh-104px)]'>
        <div className='flex items-center justify-between pb-4'>
          <Modal.Title>Edit Doll</Modal.Title>
        </div>
        <Modal.Description className='sr-only'>Edit doll</Modal.Description>
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden -mx-8 px-8'>
          <Modal.Body className='flex gap-4 md:gap-6 flex-col flex-1 overflow-auto scrollbar-medium -mx-8 px-8 [scrollbar-gutter:stable]'>
            <Input.Root>
              <Input.Label htmlFor='name'>Name</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Doll name'
                defaultValue={doll.name}
              />
            </Input.Root>
          </Modal.Body>
          <ErrorsBox errors={errors} className='mt-3' />
          <Modal.Footer className='flex-shrink-0 pt-7'>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full'>
              Save Doll
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default DollFormModal;
