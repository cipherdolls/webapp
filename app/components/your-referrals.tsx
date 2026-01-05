import { Card } from '~/components/card';
import { InformationBadge } from './ui/InformationBadge';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { Icons } from '~/components/ui/icons';
import { useUser, useUserReferralsCount } from '~/hooks/queries/userQueries';
import { useMediaQuery } from 'usehooks-ts';
import { useAlert } from '~/providers/AlertDialogProvider';

function YourReferralsSkeleton() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-[140px] animate-pulse'></div>
        <div className='rounded-full h-6 w-6 bg-neutral-04 animate-pulse'></div>
      </div>
      <div className='p-2 pt-0 rounded-xl bg-neutral-04 h-[276px] animate-pulse'></div>
    </div>
  );
}

interface YourReferralsProps {
  disabled?: boolean;
}

export const YourReferrals = ({ disabled = false }: YourReferralsProps) => {
  const { copied, copyToClipboard } = useCopyToClipboard();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: referralCount, isLoading: isReferralCountLoading } = useUserReferralsCount();
  const alert = useAlert();

  const isMobileView = useMediaQuery('(max-width: 768px)');
  const userId = user?.id || '';

  const handleInviteCopy = async () => {
    if (isMobileView && navigator.share) {
      await navigator.share({
        title: 'Join Cipherdolls',
        text: 'Join Cipherdolls with my link and get free tokens!',
        url: `${window.location.origin}?referral=${userId}`,
      });
    } else {
      await copyToClipboard(`${window.location.origin}?referral=${userId}`);
    }
  };

  if (!disabled && (isUserLoading || isReferralCountLoading || !user)) return <YourReferralsSkeleton />;

  return (
    <Card.Root className={`lg:max-w-[352px] sm:size-auto! ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className='flex items-center justify-between'>
            <Card.Label>Your Referrals</Card.Label>
            <InformationBadge className='size-6' side='top' tooltipText='Your referrals in Cipherdolls' popoverClassName='ml-auto' />
          </div>

          <Card.Main className='max-h-max flex-none'>
            <Card.Content className='border-t-0'>
              {/* How it works */}
              <div className='bg-neutral-05 flex justify-center gap-1 w-6/12 py-1.5 px-2 rounded-b-xl border border-neutral-04 border-t-0 absolute top-0 left-1/2 -translate-x-1/2'>
                <button
                  onClick={() =>
                    alert({
                      icon: '🎁',
                      title: 'Referrals rewards',
                      actionButton: '',
                      body: (
                        <p className='!text-body-md'>
                          💰 Earn LOV tokens when your invited <br />
                          referral starts chatting.
                          <br />
                          <br />
                          👤 Each active referral brings you a separate reward.
                          <br />
                          <br />
                          🔥 The more referrals you invite, the more <br />
                          LOV tokens you collect!
                        </p>
                      ),
                    })
                  }
                  className='cursor-pointer text-body-sm font-semibold text-base-black underline transition-colors hover:text-base-black/60'
                  disabled={disabled}
                >
                  How does it work?
                </button>
              </div>

              {disabled ? (
                <div className='py-8 sm:py-14'>
                  <div className='py-6 sm:py-4 px-6 flex flex-col items-center sm:justify-center sm:gap-2 gap-6'>
                    <h1 className='text-heading-h1'>🤷‍♀️</h1>
                    <div className='flex sm:items-center flex-col sm:gap-2 gap-1'>
                      <h4 className='sm:text-heading-h4 text-body-lg text-base-black text-center'>No Referrals Yet</h4>
                      <button
                        className='inline-flex justify-center text-body-md text-neutral-01 text-center underline decoration-neutral-01 underline-offset-2 cursor-not-allowed'
                        disabled
                      >
                        <span>Copy Your Referral Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (referralCount || 0) > 0 ? (
                <div className='py-8 sm:py-14'>
                  <div className='py-6 sm:py-4 px-6 flex flex-col items-center sm:justify-center sm:gap-2 gap-6'>
                    <h1 className='text-heading-h1'>🎉</h1>
                    <div className='flex items-center flex-col gap-1 sm:gap-2'>
                      <h4 className='text-heading-h4 text-base-black sm:text-center'>
                        You Have {(referralCount || 0) > 1 ? `${referralCount} Referrals` : `1 Referral`}
                      </h4>

                      <p className='text-center text-neutral-01'>Continue invite your friends and get more LOV Tokens!</p>

                      <button
                        onClick={handleInviteCopy}
                        className='inline-flex w-fit justify-center text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2'
                      >
                        {copied ? (
                          <span className='flex gap-1 items-center'>
                          Copied <Icons.copied className='w-5 h-5' />
                        </span>
                        ) : (
                          <span className='transition-opacity hover:opacity-80'>Copy Your Referral Link</span>
                        )}
                      </button>

                      {/* TODO: add total earn LOV logic  */}
                      {/*<div className='bg-base-black flex justify-center gap-1 w-8/12 py-1.5 px-2 rounded-t-xl border-b-0 text-body-sm text-base-white absolute bottom-0 left-1/2 -translate-x-1/2'>*/}
                      {/*  Total earn: <span className='text-base-white font-semibold'>{referralCount} LOV</span>*/}
                      {/*</div>*/}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='py-8 sm:py-14'>
                  <div className='py-6 sm:py-4 px-6 flex flex-col items-center sm:justify-center sm:gap-2 gap-6'>
                    <h1 className='text-heading-h1'>🤷‍♀️</h1>
                    <div className='flex sm:items-center flex-col sm:gap-2 gap-1'>
                      <h4 className='sm:text-heading-h4 text-body-lg text-base-black text-center'>You Have No Referrals Yet</h4>
                      <button
                        onClick={handleInviteCopy}
                        className='inline-flex justify-center text-body-md text-neutral-01 text-center underline decoration-neutral-01 underline-offset-2'
                      >
                        {copied ? (
                          <span className='flex gap-1 items-center'>
                          Copied <Icons.copied className='w-5 h-5' />
                        </span>
                        ) : (
                          <span className='transition-opacity hover:opacity-80'>Copy Your Referral Link</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card.Main>
    </Card.Root>
  );
};
