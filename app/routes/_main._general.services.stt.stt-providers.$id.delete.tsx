import { useNavigate, useFetcher, useSearchParams } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

import type { Route } from './+types/_main._general.services.ai.chat-models.$id.edit';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import type { ChatModel } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Delete STT Provider' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const sttProviderId = params.id;
  const res = await fetchWithAuth(`stt-providers/${sttProviderId}`);
  return await res.json();
}

export default function STTProviderDelete({ loaderData }: Route.ComponentProps) {
  const sttProvider: ChatModel = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/services/stt`);
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title className='sr-only'>Delete Provider {sttProvider.name}</Modal.Title>
        <Modal.Description className='sr-only'>Delete Provider {sttProvider.name}</Modal.Description>
        <fetcher.Form
          action={`/stt-providers/${sttProvider.id}/destroy`}
          method='DELETE'
          className='size-full flex flex-col items-center justify-center'
        >
          <Modal.Body className='flex flex-col gap-3.5'>
            <h1 className='text-heading-h1 font-semibold text-center'>🗑️</h1>
            <div className='flex flex-col gap-2'>
              <h2 className='text-heading-h2 font-semibold text-center text-base-black'>Delete provider {sttProvider.name}?</h2>
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
