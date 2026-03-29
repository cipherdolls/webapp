import { Card } from '~/components/card';
import { InformationBadge } from './ui/InformationBadge';
import { useAlert } from '~/providers/AlertDialogProvider';
import CreateTokenAllowanceModal from '~/components/CreateTokenAllowanceModal';
import { useTokenPermits } from '~/hooks/queries/tokenQueries';

interface YourGiftProps {
  disabled?: boolean;
}

export const YourGift = ({ disabled = false }: YourGiftProps) => {
  const { data: tokenPermitsPaginated, isLoading: tokenPermitsLoading } = useTokenPermits();
  const alert = useAlert();

  const permits = tokenPermitsPaginated?.data || [];

  // For authenticated users who have permits, hide the gift card
  // For guests (disabled), always show the disabled state
  if (!disabled && (tokenPermitsLoading || permits.length !== 0)) return null;

  return (
    <Card.Root className={`lg:max-w-[352px] sm:size-auto! ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className='flex items-center justify-between'>
        <Card.Label>Your Gift</Card.Label>
        <InformationBadge className='size-6' side='top' tooltipText='Your personal gift from Cipherdolls' popoverClassName='ml-auto' />
      </div>

      <Card.Main className='max-h-max flex-none'>
        <Card.Content className='border-t-0'>
          <div className='py-8 sm:py-14'>
            <div className='py-6 px-6 flex flex-col items-center gap-2'>
              <h1 className='text-heading-h1'>🎁</h1>
              <div className='flex flex-col gap-1 text-center'>
                <div className='bg-neutral-05 flex justify-center gap-1 w-6/12 py-1.5 px-2 rounded-b-xl border border-neutral-04 border-t-0 absolute top-0 left-1/2 -translate-x-1/2'>
                  <button
                    onClick={() =>
                      alert({
                        icon: '🎁',
                        title: 'Free USDC',
                        actionButton: '',
                        body: (
                          <p className='!text-body-md'>
                            🎁 Get Free USDC with your <br />
                            first Token Allowance
                            <br />
                            <br />
                            🔑 Allowance is a permission that controls who can use your <b>(USDC)</b> tokens and how much they can use
                            <br />
                            <br />
                            ❗ We will only have access to your USDC, <br />
                            and only to the exact amount you choose to use
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
                <h4 className='text-heading-h4 text-base-black'>Free USDC!</h4>
                <p className='text-body-md text-neutral-01'>Get Free USDC with your first Token Allowance in Cipherdolls</p>

                {!disabled && (
                  <CreateTokenAllowanceModal>
                    <button className='underline text-neutral-01 hover:opacity-80 transition-opacity'>Set allowance</button>
                  </CreateTokenAllowanceModal>
                )}
                {disabled && (
                  <button className='underline text-neutral-01 cursor-not-allowed' disabled>
                    Set allowance
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Main>
    </Card.Root>
  );
};
