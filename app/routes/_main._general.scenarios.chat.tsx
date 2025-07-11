import { redirect, useFetcher, useNavigate, Form } from 'react-router';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.chat';
import type { Avatar, AvatarsPaginated, Scenario } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { useState } from 'react';
import * as Modal from '~/components/ui/new-modal';
import { getPicture } from '~/utils/getPicture';
import ErrorsBox from '~/components/ui/input/errorsBox';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Start new Chat' }];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get('scenarioId');

  if (!scenarioId) {
    return redirect('/scenarios');
  }

  const [scenarioRes, avatarsRes] = await Promise.all([fetchWithAuth(`scenarios/${scenarioId}`), fetchWithAuth('avatars?published=true')]);

  const scenario: Scenario = await scenarioRes.json();
  const { data: avatars }: AvatarsPaginated = await avatarsRes.json();

  return { scenario, avatars };
}


export default function ScenarioChat({ loaderData }: Route.ComponentProps) {
  const { scenario, avatars } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  const errors = fetcher.data?.errors;

  const handleClose = () => {
    navigate('/scenarios');
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content className='max-w-2xl'>
        <Modal.Title>Start new Chat</Modal.Title>
        <Modal.Description>Select an avatar you like to start the chat with "{scenario.name}".</Modal.Description>

        <Modal.Body className='py-6'>
          <ErrorsBox errors={errors} />

          <div className='space-y-4'>
            <div className='bg-neutral-05 p-4 rounded-xl'>
              <h3 className='font-semibold text-base-black mb-2'>Selected Scenario:</h3>
              <p className='text-sm text-neutral-01'>{scenario.name}</p>
            </div>

            <div>
              <h3 className='font-semibold text-base-black mb-3'>Select Avatar:</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto'>
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedAvatar?.id === avatar.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
                    }`}
                  >
                    <img
                      src={getPicture(avatar, 'avatars', false)}
                      srcSet={getPicture(avatar, 'avatars', true)}
                      alt={avatar.name}
                      className='w-12 h-12 rounded-full object-cover'
                    />
                    <div className='text-left'>
                      <p className='font-semibold text-base-black'>{avatar.name}</p>
                      <p className='text-sm text-neutral-01'>{avatar.shortDesc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className='pt-0!'>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>
              Cancel
            </Button.Root>
          </Modal.Close>
          {selectedAvatar ? (
            <Form method='POST' action='/chats' className='w-full'>
              <input type='hidden' name='avatarId' value={selectedAvatar.id} />
              <input type='hidden' name='scenarioId' value={scenario.id} />
              <Button.Root type='submit' disabled={fetcher.state === 'submitting'} className='w-full'>
                {fetcher.state === 'submitting' ? (
                  <>
                    <Icons.loading className='w-4 h-4 animate-spin' />
                    Creating Chat...
                  </>
                ) : (
                  'Create Chat'
                )}
              </Button.Root>
            </Form>
          ) : (
            <Button.Root disabled className='w-full'>
              Select an Avatar
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
