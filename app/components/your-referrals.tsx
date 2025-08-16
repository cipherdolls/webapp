import { Card } from '~/components/card';
import { InformationBadge } from './ui/InformationBadge';
import type { User } from '~/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { Icons } from '~/components/ui/icons';

// TODO: Add referrals display logic

export const YourReferrals = ({ user }: { user: User }) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleInviteCopy = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join Cipherdolls',
        text: 'Join Cipherdolls with my link and get free tokens!',
        url: `https://cipherdolls.com?referral=${user.id}`,
      });
    } else {
      await copyToClipboard(`www.cipherdolls.com?referral=${user.id}`);
    }
  };

  return (
    <Card.Root className='sm:max-w-[352px]'>
      <div className='flex items-center justify-between'>
        <Card.Label>Your Referrals</Card.Label>
        <InformationBadge className='size-6' side='top' tooltipText='Your personal referrals in Cipherdolls' popoverClassName='ml-auto' />
      </div>
      <Card.Main className='max-h-max flex-none'>
        <Card.Content className='border-t-0'>
          <div className='sm:py-14'>
            <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
              <h1 className='sm:text-heading-h1 text-heading-h2'>🤷‍♀️</h1>
              <div className='flex items-center flex-col sm:gap-2 gap-1'>
                <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Referrals Yet</h4>
                <button
                  onClick={handleInviteCopy}
                  className='inline-flex w-fit justify-center text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2'
                >
                  {copied ? (
                      <span className='flex gap-1 items-center'>Copied <Icons.copied className='w-5 h-5'/></span>
                    ) : (
                      <span className='transition-opacity hover:opacity-80'>Copy Your Referral Link</span>
                    )
                  }
                </button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};
