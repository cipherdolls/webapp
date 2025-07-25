import { Link, Form } from 'react-router';
import * as Modal from '~/components/ui/new-modal';
import AvatarCard from '~/components/AvatarCardReusable';
import * as Button from '~/components/ui/button/button';
import type { Avatar } from '~/types';
import { useState } from 'react';
import { cn } from '~/utils/cn';

interface AvatarSelectModalProps {
  avatars: Avatar[];
  children: React.ReactNode;
}

const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ avatars, children }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Filter out avatars that already have chats (unless we want to show them for new scenarios)
  const availableAvatars = avatars.filter((avatar) => avatar.chats.length === 0 || avatar.scenarios.length > 1);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    if (avatar.defaultScenarioId) {
      setSelectedScenario(avatar.defaultScenarioId);
    } else if (avatar.scenarios.length === 1) {
      setSelectedScenario(avatar.scenarios[0].id);
    } else {
      setSelectedScenario(null);
    }
  };

  const handleBack = () => {
    setSelectedAvatar(null);
    setSelectedScenario(null);
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content title={selectedAvatar ? `${selectedAvatar.name} - Choose Scenario` : 'Choose Avatar'}>
        {!selectedAvatar ? (
          <>
            {availableAvatars.map((avatar) => (
              <AvatarCard key={avatar.id} avatar={avatar} className='max-sm:!px-0'>
                <Link to={`/avatars/${avatar.id}`}>
                  <AvatarCard.Avatar />
                </Link>
                <AvatarCard.Content>
                  <AvatarCard.Name />
                  <AvatarCard.Description>{avatar.shortDesc}</AvatarCard.Description>
                  <div className='text-xs text-neutral-01 mt-1'>
                    {avatar.scenarios.length} scenario{avatar.scenarios.length !== 1 ? 's' : ''}
                  </div>
                </AvatarCard.Content>
                <AvatarCard.Actions>
                  {avatar.scenarios.length === 1 ? (
                    <Modal.Close asChild>
                      <AvatarCard.ChatButton />
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
          <div className='space-y-4'>
            <div className='flex items-center gap-3 pb-4 border-b border-neutral-04'>
              <button onClick={handleBack} className='text-neutral-01 hover:text-base-black'>
                ← Back
              </button>
              <AvatarCard avatar={selectedAvatar} className='flex items-center gap-3 border-0 p-0'>
                <AvatarCard.Avatar className='size-10' />
                <AvatarCard.Content>
                  <AvatarCard.Name className='text-body-md' />
                  <AvatarCard.Description>{selectedAvatar.shortDesc}</AvatarCard.Description>
                </AvatarCard.Content>
              </AvatarCard>
            </div>

            <div className='space-y-2'>
              {selectedAvatar.scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-colors',
                    selectedScenario === scenario.id ? 'border-base-black bg-neutral-05' : 'border-neutral-04 hover:border-neutral-02'
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <h5 className='font-semibold'>{scenario.name}</h5>
                    {selectedAvatar.defaultScenarioId === scenario.id && (
                      <span className='text-xs bg-base-black text-white px-2 py-1 rounded'>Default</span>
                    )}
                  </div>
                  {scenario.introduction && <p className='text-sm text-neutral-01 mt-1 line-clamp-2'>{scenario.introduction}</p>}
                </button>
              ))}
            </div>

            {selectedScenario && (
              <Form method='POST' action='/chats' className='pt-4'>
                <input hidden name='avatarId' value={selectedAvatar.id} readOnly />
                <input hidden name='scenarioId' value={selectedScenario} readOnly />
                <Modal.Close asChild>
                  <Button.Root type='submit' className='w-full'>
                    Start Chat
                  </Button.Root>
                </Modal.Close>
              </Form>
            )}
          </div>
        )}
      </Modal.Content>
    </Modal.Root>
  );
};

export default AvatarSelectModal;
