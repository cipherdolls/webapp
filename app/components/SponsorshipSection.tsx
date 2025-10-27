import React, { useState, useMemo } from 'react';
import type { Sponsorship } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import DetailCard from '~/components/ui/detail/detail-card';
import { useCreateSponsorship, useDeleteSponsorship } from '~/hooks/queries/sponsorshipMutations';
import * as Dialog from '@radix-ui/react-dialog';

interface SponsorshipSectionProps {
  scenarioId: string;
  sponsorships: Sponsorship[];
  currentUserId: string;
  userHasSponsored: boolean;
}

const SponsorshipSection: React.FC<SponsorshipSectionProps> = ({ scenarioId, sponsorships, currentUserId, userHasSponsored }) => {
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: createSponsorship, isPending: isCreating } = useCreateSponsorship();
  const { mutate: deleteSponsorship, isPending: isDeleting } = useDeleteSponsorship();

  const userSponsorship = useMemo(() => sponsorships.find((s) => s.userId === currentUserId), [sponsorships, currentUserId]);

  const isPending = isCreating || isDeleting;

  const handleConfirm = () => {
    if (userHasSponsored && userSponsorship) {
      deleteSponsorship({ sponsorshipId: userSponsorship.id });
    } else {
      createSponsorship({ scenarioId });
    }
    setIsModalOpen(false);
  };

  const visibleSponsorships = showAll ? sponsorships : sponsorships.slice(0, 5);
  const hasMoreSponsorships = sponsorships.length > 5;

  return (
    <DetailCard isScenario title='Sponsorships'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <span className='text-body-sm text-neutral-01'>
            {sponsorships.length === 0
              ? 'No sponsors yet. Be the first!'
              : `${sponsorships.length} ${sponsorships.length === 1 ? 'Sponsor' : 'Sponsors'}`}
          </span>
        </div>

        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <Button.Root variant={userHasSponsored ? 'secondary' : 'primary'} disabled={isPending} className='flex gap-2 w-full' size='md'>
              <Button.Icon as={userHasSponsored ? Icons.check : Icons.star} />
              {isPending ? 'Processing...' : userHasSponsored ? 'Sponsored' : 'Sponsor this Scenario'}
            </Button.Root>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className='bg-neutral-02 fixed inset-0 z-50'></Dialog.Overlay>

            <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-[51]'>
              <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
              <div className='flex flex-col gap-10'>
                <div className='flex flex-col gap-4.5 items-center justify-center'>
                  <h1 className='text-heading-h2 sm:text-heading-h1'>{userHasSponsored ? '⚠️' : '⭐'}</h1>
                  <div className='flex flex-col gap-2'>
                    <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center break-all'>
                      {userHasSponsored ? 'Remove Sponsorship?' : 'Sponsor this Scenario?'}
                    </Dialog.Title>
                    <Dialog.Description className='sm:text-body-lg text-base-black text-body-md text-center'>
                      {userHasSponsored ? (
                        <>
                          <p className='mb-2'>Are you sure you want to remove your sponsorship?</p>
                          <p className='text-body-sm text-neutral-01'>
                            Users will no longer be able to use this scenario with your tokens.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className='mb-3'>
                            When you sponsor this scenario, other users can interact with it using your token balance instead of their own.
                          </p>
                          <div className='text-left bg-neutral-05 rounded-lg p-3'>
                            <p className='text-body-sm font-semibold mb-2'>As a sponsor, you will:</p>
                            <ul className='text-body-sm text-neutral-01 space-y-1.5'>
                              <li className='flex gap-2'>
                                <span className='shrink-0'>•</span>
                                <span>Cover AI token costs for all users of this scenario</span>
                              </li>
                              <li className='flex gap-2'>
                                <span className='shrink-0'>•</span>
                                <span>Support the scenario creator and community</span>
                              </li>
                              <li className='flex gap-2'>
                                <span className='shrink-0'>•</span>
                                <span>Help make AI experiences accessible to everyone</span>
                              </li>
                            </ul>
                          </div>
                        </>
                      )}
                    </Dialog.Description>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <Dialog.Close asChild>
                    <Button.Root variant='secondary' className='w-full'>
                      No, Cancel
                    </Button.Root>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button.Root variant={userHasSponsored ? 'danger' : 'primary'} className='w-full' onClick={handleConfirm}>
                      {userHasSponsored ? 'Yes, Remove' : 'Yes, Sponsor'}
                    </Button.Root>
                  </Dialog.Close>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {sponsorships.length > 0 && (
          <div className='flex flex-col gap-2 pt-2 border-t border-neutral-04'>
            <h4 className='text-body-sm font-semibold text-base-black'>Recent Sponsors</h4>
            <div className='flex flex-col gap-2'>
              {visibleSponsorships.map((sponsorship) => (
                <div key={sponsorship.id} className='flex items-center justify-between py-1'>
                  <div className='flex items-center gap-2 min-w-0 flex-1'>
                    <div className='size-6 shrink-0 rounded-full bg-neutral-04 flex items-center justify-center'>
                      <span className='text-label text-neutral-01'>👤</span>
                    </div>
                    <span className='text-body-sm text-base-black truncate'>
                      {sponsorship.user?.name || `User ${sponsorship.userId.slice(0, 8)}`}
                    </span>
                  </div>
                  {sponsorship.userId === currentUserId && <span className='text-body-sm text-neutral-01'>(You)</span>}
                </div>
              ))}
            </div>

            {hasMoreSponsorships && (
              <Button.Root variant='secondary' size='sm' onClick={() => setShowAll(!showAll)} className='w-full mt-2'>
                {showAll ? 'Show less' : `Show ${sponsorships.length - 5} more`}
                <Button.Icon as={Icons.chevronDown} className={`size-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
              </Button.Root>
            )}
          </div>
        )}
      </div>
    </DetailCard>
  );
};

export default SponsorshipSection;
