import React, { useState, useMemo } from 'react';
import type { Sponsorship } from '~/types';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import DetailCard from '~/components/ui/detail/detail-card';
import { useCreateSponsorship, useDeleteSponsorship } from '~/hooks/queries/sponsorshipMutations';
import * as Dialog from '@radix-ui/react-dialog';
import { useAlert } from '~/providers/AlertDialogProvider';
import { motion } from 'motion/react';
import { ANIMATE_MODAL_SHOW_CENTER, ANIMATE_OVERLAY } from '~/constants';

interface SponsorshipSectionProps {
  scenarioId: string;
  sponsorships: Sponsorship[];
  currentUserId: string;
  userHasSponsored: boolean;
  isPublishedScenario: boolean;
}

const SponsorshipSection: React.FC<SponsorshipSectionProps> = ({ scenarioId, sponsorships, currentUserId, userHasSponsored, isPublishedScenario }) => {
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: createSponsorship, isPending: isCreating } = useCreateSponsorship();
  const { mutate: deleteSponsorship, isPending: isDeleting } = useDeleteSponsorship();

  const alert = useAlert();

  const userSponsorship = useMemo(() => sponsorships.find((s) => s.userId === currentUserId), [sponsorships, currentUserId]);

  const isPending = isCreating || isDeleting;

  const handleConfirm = async () => {
    if (userHasSponsored && userSponsorship) {
      deleteSponsorship({ sponsorshipId: userSponsorship.id });
    } else if (!isPublishedScenario) {
      return alert({
        icon: '🌐',
        title: 'Publishing Required',
        actionButton: '',
        body: (
          <p className='!text-body-md'>
            ❗ Only public scenarios can be sponsored,<br />
            firstly you need to publish this scenario
            <br />
            <br />
            📌 To publish the scenario, click the <span className='text-base-black font-semibold'>Edit</span> button in the top right side
          </p>
        ),
      })
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
            <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-[80]'>
              <motion.div
                initial={ANIMATE_OVERLAY.initial}
                animate={ANIMATE_OVERLAY.animate}
                transition={ANIMATE_OVERLAY.transition}
              >
                <div
                  className='absolute  left-1/2 -translate-x-1/2
        w-[375px] h-[224px] sm:w-[480px] sm:h-[282px]
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
                />
                <div
                  className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)]
        [mask-size:100%_100%,480px_282px]
        [mask-position:0_0,50%_50%]
        [mask-repeat:no-repeat]
        [mask-composite:exclude]
        '
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='282' viewBox='0 0 480 282' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='282' rx='12' fill='black'/%3E%3C/svg%3E\")",
                  }}
                />
              </motion.div>
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
             <motion.div
               initial={ANIMATE_MODAL_SHOW_CENTER.initial}
               animate={ANIMATE_MODAL_SHOW_CENTER.animate}
               transition={ANIMATE_MODAL_SHOW_CENTER.transition}
               className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-[100]'
             >
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
             </motion.div>
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
