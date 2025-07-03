import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import type { Avatar, Scenario } from '~/types';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import { useState } from 'react';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { PICTURE_SIZE } from '~/constants';

interface SelectAvatarModalProps {
  avatars: Avatar[];
  scenario: Scenario;
  triggerContent?: React.ReactNode;
}

const SelectAvatarModal = ({ avatars, scenario, triggerContent }: SelectAvatarModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [successMessages, setSuccessMessages] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setIsSubmitting({});
      setSuccessMessages({});
      setErrorMessage(null);
    }
  };

  const handleAddScenario = async (avatar: Avatar) => {
    try {
      setIsSubmitting((prev) => ({ ...prev, [avatar.id]: true }));

      const scenarioExists = avatar.scenarios?.some((s) => s.id === scenario.id);
      if (scenarioExists) {
        setSuccessMessages((prev) => ({ ...prev, [avatar.id]: true }));
        setIsSubmitting((prev) => ({ ...prev, [avatar.id]: false }));
        return;
      }

      const existingScenarioIds = Array.isArray(avatar.scenarios) ? avatar.scenarios.map((s) => s.id) : [];
      const scenarioIds = [...existingScenarioIds, scenario.id];

      const response = await fetchWithAuth(`avatars/${avatar.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: avatar.name,
          shortDesc: avatar.shortDesc,
          character: avatar.character,
          ttsVoiceId: avatar.ttsVoiceId,
          gender: avatar.gender || null,
          published: avatar.published,
          scenarioIds,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccessMessages((prev) => ({ ...prev, [avatar.id]: true }));
      } else {
        const errorText = await response.text();
        console.error('Error updating avatar:', errorText);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [avatar.id]: false }));
    }
  };

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {triggerContent || (
          <Button.Root size='sm' className='px-2.5 h-8'>
            Chat
          </Button.Root>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-neutral-02 bg-opacity-50 fixed inset-0 z-[1000000]' />

        <Dialog.Content className='fixed inset-0 sm:top-2 sm:right-2 sm:bottom-2 sm:left-auto sm:max-w-[408px] w-full bg-white h-auto sm:rounded-xl shadow-bottom-level-2 overflow-auto pb-2 z-[1000000]'>
          <Dialog.Title className='text-heading-h3 text-base-black py-4 sm:py-[26px] flex items-center px-5'>
            <Dialog.Close className='sm:hidden block'>
              <Icons.chevronLeft className='mr-3' />
            </Dialog.Close>
            Add Scenario to My Avatar
          </Dialog.Title>
          <Dialog.Description className='sr-only'>
            Select an avatar to add the scenario <strong>{scenario.name}</strong> to.
          </Dialog.Description>

          {errorMessage && <div className='mb-4 p-3 bg-red-100 text-specials-danger rounded-lg'>{errorMessage}</div>}

          <div className='flex flex-col px-2'>
            {avatars.length === 0 ? (
              <div className='py-6 text-center text-neutral-01'>
                <p>You don't have any avatars yet.</p>
                <Button.Root className='mt-4 px-6' asChild>
                  <Dialog.Close asChild>
                    <a href='/avatars/new'>Create an Avatar</a>
                  </Dialog.Close>
                </Button.Root>
              </div>
            ) : (
              avatars.map((avatar, index) => {
                const isScenarioAdded = avatar.scenarios?.some((s) => s.id === scenario.id) || successMessages[avatar.id];
                return (
                  <div
                    key={index}
                    className='p-3 rounded-xl hover:bg-neutral-05 transition-colors flex items-center justify-between gap-4 '
                  >
                    <div className='flex items-center gap-4'>
                      <img
                        src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
                        srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
                        alt={avatar.name}
                        className='size-14 rounded-full object-cover'
                      />
                      <div className='flex flex-col gap-05'>
                        <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>{avatar.name}</p>
                        <span className='text-body-sm text-neutral-01 text-left line-clamp-1'>{avatar.shortDesc}</span>
                      </div>
                    </div>
                    <Button.Root
                      variant={isScenarioAdded ? 'secondary' : 'primary'}
                      className='h-10 px-4'
                      disabled={isScenarioAdded || isSubmitting[avatar.id]}
                      onClick={() => handleAddScenario(avatar)}
                    >
                      {isSubmitting[avatar.id] ? <Icons.loading className='animate-spin size-4' /> : isScenarioAdded ? 'Added' : 'Add'}
                    </Button.Root>
                  </div>
                );
              })
            )}
          </div>
          <Dialog.Close asChild>
            <button
              className='absolute focus:outline-none -left-12 top-4.5 size-10 bg-white rounded-full flex items-center justify-center'
              aria-label='Close'
            >
              <Icons.close className='text-base-black' />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SelectAvatarModal;
