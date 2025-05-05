import { useNavigate, useFetcher, useSearchParams } from 'react-router';
import type { Route } from './+types/_main._general.services.ai.providers.delete';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete AI Provider' }];
}

export default function AiProviderDelete() {
  const [searchParams] = useSearchParams();
  const aiProviderId = searchParams.get('id') || '';
  const name = searchParams.get('name') || '';
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/ai`);
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title className='sr-only'>Delete AI Provider</Modal.Title>
        <Modal.Description className='sr-only'>Delete AI Provider</Modal.Description>
        <fetcher.Form
          action={`/ai-providers/${aiProviderId}/destroy`}
          method='DELETE'
          className='size-full flex flex-col items-center justify-center'
        >
          <Modal.Body className='flex flex-col gap-3.5'>
            <h1 className='text-heading-h1 font-semibold text-center'>🗑️</h1>
            <div className='flex flex-col gap-2'>
              <h2 className='text-heading-h2 font-semibold text-center text-base-black'>Delete {name}?</h2>
              <span className='text-center text-base-black text-body-lg'>You will not be able to restore the data.</span>
            </div>
          </Modal.Body>
          <Modal.Footer className='w-full'>
            <Button.Root type='submit' variant='secondary' className='w-full'>
              Yes, Delete
            </Button.Root>

            <Modal.Close asChild>
              <Button.Root aria-label='Close' className='w-full'>
                No, Leave
              </Button.Root>
            </Modal.Close>
          </Modal.Footer>
        </fetcher.Form>
      </Modal.Content>
    </Modal.Root>
  );
}
