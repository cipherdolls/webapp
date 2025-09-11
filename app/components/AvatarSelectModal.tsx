import { Link, Form, useNavigate } from 'react-router';
import * as Modal from '~/components/ui/new-modal';
import AvatarCard from '~/components/AvatarCardReusable';
import * as Button from '~/components/ui/button/button';
import type { Avatar, Scenario } from '~/types';
import React, { useState } from 'react';
import { cn } from '~/utils/cn';
import { ROUTES } from '~/constants';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useCreateChat, useDeleteChat } from '~/hooks/queries/chatMutations';
import { getPicture } from '~/utils/getPicture';

interface AvatarSelectModalProps {
  avatars: Avatar[];
  children: React.ReactNode;
}

const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ avatars, children }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const { mutate: createChat, isPending: isPendingCreateChat, error: errorCreateChat } = useCreateChat();
  const { mutate: deleteChat, isPending: isDeletingChat, error: errorDeleteChat } = useDeleteChat();

  const navigate = useNavigate();
  const confirm = useConfirm();

  const availableAvatars = avatars.filter((avatar) => (avatar.chats?.length || 0) === 0 || (avatar.scenarios?.length || 0) > 1);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    if (avatar.scenarios?.length === 1) {
      setSelectedScenario(avatar.scenarios?.[0] || null);
    } else if ((avatar.scenarios?.length || 0) > 0) {
      setSelectedScenario(avatar.scenarios?.[0] || null);
    } else {
      setSelectedScenario(null);
    }
  };

  const handleBack = () => {
    setSelectedAvatar(null);
    setSelectedScenario(null);
  };

  const handleCreateChat = async (avatarHasOneScenario?: Avatar | undefined) => {
    if (selectedAvatar && selectedScenario) {
      const hasChatWithSameScenario = selectedAvatar.chats?.find((chat) => chat.scenarioId === selectedScenario.id);

      if (hasChatWithSameScenario) {
        const confirmResult = await confirm({
          icon: '🗑️',
          title: 'Delete Previous Chat?',
          body: 'If you create a new chat with this scenario, your previous chat will be permanently deleted and cannot be restored. Do you want to continue?',
          actionButton: 'Yes, Create New',
        });

        if (!confirmResult) return;

        deleteChat(hasChatWithSameScenario.id, {
          onSuccess: () => {
            createChat(
              { avatarId: selectedAvatar.id, scenarioId: selectedScenario.id },
              {
                onSuccess: (newChat) => {
                  handleBack()
                  navigate(`${ROUTES.chats}/${newChat.id}`);
                },
              }
            );
          },
        });
      } else {
        createChat(
          { avatarId: selectedAvatar.id, scenarioId: selectedScenario.id },
          {
            onSuccess: (newChat) => {
              handleBack()
              navigate(`${ROUTES.chats}/${newChat.id}`);
            },
          }
        );
      }
    }

    if (avatarHasOneScenario && avatarHasOneScenario.scenarios?.length === 1) {
      createChat(
        { avatarId: avatarHasOneScenario.id, scenarioId: avatarHasOneScenario.scenarios[0].id },
        {
          onSuccess: (newChat) => {
            handleBack()
            navigate(`${ROUTES.chats}/${newChat.id}`);
          },
        }
      );
    }
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className='max-sm:p-6' title={selectedAvatar ? `${selectedAvatar.name} - Choose Scenario` : 'Choose Avatar'}>
        {!selectedAvatar ? (
          <>
            {availableAvatars.map((avatar) => (
              <AvatarCard key={avatar.id} avatar={avatar} className='flex flex-wrap max-sm:!px-0 sm:flex-nowrap'>
                <Link to={`${ROUTES.avatars}/${avatar.id}`}>
                  <AvatarCard.Avatar />
                </Link>
                <AvatarCard.Content className='min-w-[60px] sm:min-w-auto'>
                  <AvatarCard.Name />
                  <AvatarCard.Description>{avatar.shortDesc}</AvatarCard.Description>
                  <div className='text-xs text-neutral-01 mt-1'>
                    {avatar.scenarios?.length || 0} scenario{(avatar.scenarios?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </AvatarCard.Content>
                <AvatarCard.Actions>
                  {(avatar.scenarios?.length || 0) === 1 ? (
                    <Modal.Close asChild>
                      <Button.Root onClick={() => handleCreateChat(avatar)} size='sm' className='px-5'>
                        Start Chat
                      </Button.Root>
                    </Modal.Close>
                  ) : (
                    <Button.Root size='sm' className='px-5' onClick={() => handleAvatarSelect(avatar)}>
                      Choose Scenario
                    </Button.Root>
                  )}
                </AvatarCard.Actions>
              </AvatarCard>
            ))}
          </>
        ) : (
          <div>
            <div className='relative h-32 -mx-8 -mt-8 mb-6'>
              <div className='absolute inset-0 bg-gradient-1 rounded-t-xl overflow-hidden'>
                {selectedScenario?.picture ? (
                  <img
                    src={getPicture(selectedScenario, 'scenarios', false)}
                    srcSet={getPicture(selectedScenario, 'scenarios', true)}
                    alt={selectedScenario.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-1 bg-neutral-03' />
                )}
              </div>

              <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
                <div className='w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg'>
                  <img
                    src={getPicture(selectedAvatar, 'avatars', false)}
                    srcSet={getPicture(selectedAvatar, 'avatars', true)}
                    alt={selectedAvatar?.name ?? 'Avatar picture'}
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
            </div>

            <Modal.Title className='text-center mt-14'>Select Scenario</Modal.Title>

            <Modal.Description className='text-center'>{`Choose a  Scenario for ${selectedAvatar?.name}`}</Modal.Description>

            <div className='py-6 flex flex-col gap-4 max-h-96 overflow-y-auto'>
              {(selectedAvatar.scenarios || []).map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-colors',
                    selectedScenario?.id === scenario.id ? 'border-base-black bg-neutral-05' : 'border-neutral-04 hover:border-neutral-02'
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <h5 className='font-semibold'>{scenario.name}</h5>
                    {selectedAvatar.scenarios?.[0]?.id === scenario.id && (
                      <span className='text-xs bg-base-black text-white px-2 py-1 rounded'>Default</span>
                    )}
                  </div>
                  {scenario.introduction && <p className='text-sm text-neutral-01 mt-1 line-clamp-2'>{scenario.introduction}</p>}
                </button>
              ))}
            </div>

            <Modal.Footer>
              <Button.Root onClick={handleBack} variant='secondary' className='w-full'>
                Cancel
              </Button.Root>
              <Modal.Close asChild>
                <Button.Root onClick={() => handleCreateChat()} className='w-full'>
                  Start Chat
                </Button.Root>
              </Modal.Close>
            </Modal.Footer>
          </div>
        )}
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarSelectModal;
