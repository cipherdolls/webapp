import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import type { Gender, User } from '~/types';
import { useEffect, useState } from 'react';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { cn } from '~/utils/cn';
import { useUpdateUser } from '~/hooks/queries/userMutations';
import { useCreateTokenPermit } from '~/hooks/queries/tokenMutations';
import { Icons } from '~/components/ui/icons';
import * as Slider from '~/components/ui/slider';
import { PermitButton } from '~/components/buttons/PermitButton';
import { useNavigate } from 'react-router';
import { ROUTES, USDC_TOKEN_ADDRESS, USDC_TOKEN_NAME, USDC_TOKEN_VERSION, SPENDER_ADDRESS } from '~/constants';
import { useAuthStore } from '~/store/useAuthStore';

type Steps = 'Welcome' | 'Account' | 'Permit';

interface WelcomeOnboardWizardProps {
  me: User;
  onClose: () => void;
}

export const WelcomeOnboardWizard = ({ me, onClose }: WelcomeOnboardWizardProps) => {
  const [gender, setGender] = useState<Gender | null>('Female');
  const [currentStep, setCurrentStep] = useState<Steps>('Welcome');

  const navigate = useNavigate();

  const updateUserMutation = useUpdateUser();
  const createTokenPermitMutation = useCreateTokenPermit();

  // Fibonacci sequence for fixed amounts
  const fibonacciAmounts = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  const [selectedIndex, setSelectedIndex] = useState(4);
  const amount = fibonacciAmounts[selectedIndex];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = Object.fromEntries(formData.entries());

    const updateData = {
      userId: me.id,
      signerAddress: me.signerAddress,
      name: data.name,
      character: data.character,
      gender: gender,
    };

    updateUserMutation.mutate(updateData);
  };

  const handlePermitSigned = async (permit: {
    owner: string;
    spender: string;
    value: string;
    nonce: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
  }) => {
    createTokenPermitMutation.mutate({
      owner: permit.owner,
      spender: permit.spender,
      value: permit.value,
      nonce: permit.nonce,
      deadline: permit.deadline.toString(),
      v: permit.v.toString(),
      r: permit.r,
      s: permit.s,
    });
    useAuthStore.getState().setOnboardWizardCompleted(true);
    navigate(ROUTES.account);
  };

  useEffect(() => {
    if (updateUserMutation.isSuccess && !updateUserMutation.error) {
      setCurrentStep('Permit');
    }
  }, [updateUserMutation.isSuccess, updateUserMutation.error]);

  return (
    <div className='relative mx-auto my-auto focus:outline-none w-full max-w-[480px]'>
      <Button.Root onClick={onClose} size='icon' variant='white' className='-top-2 -translate-x-1/2 left-1/2 shadow-bottom transition-opacity hover:opacity-80'>
        <Icons.close />
      </Button.Root>

      <div
        className='bg-gradient-1 rounded-xl px-4.5 shadow-bottom backdrop-blur-lg z-20 max-h-[80vh] overflow-y-auto sm:py-8 py-9 sm:px-10'
      >
        {currentStep === 'Welcome' && (
          <div className='flex items-center flex-col gap-5 text-center'>
            <div className='text-heading-h1 sm:text-8xl'>🎁</div>
            <div className='flex flex-col gap-3'>
              <h3 className='text-heading-h3 text-base-black sm:text-heading-h2 max-w-96'>Welcome to Cipherdolls!</h3>
              <p className='max-w-96 mx-auto sm:text-body-lg text-body-md text-neutral-01'>
                Set up your account and create your First Token Permit to start using Cipherdolls
              </p>
            </div>

            <Button.Root className='w-full' onClick={() => setCurrentStep('Account')}>
              Next Step <Icons.chevronRight />
            </Button.Root>
          </div>
        )}

        {currentStep === 'Account' && (
          <div className='flex flex-col sm:gap-4.5 gap-3'>
            <div className='text-center text-heading-h2 sm:text-heading-h1'>✏️</div>
            <div className='flex flex-col gap-2 text-center'>
              <h3 className='sm:text-heading-h2 text-heading-h3 text-base-black'>Enter Your Info</h3>
              <p className='sm:text-body-lg text-body-md text-neutral-01'>Update your name and gender</p>
            </div>

            <form role='form' onSubmit={handleSubmit} className='sm:mt-[22px] mt-4.5'>
              <div className='flex flex-col gap-4'>
                {updateUserMutation.error && <ErrorsBox errors={[updateUserMutation.error.message]} className='mb-2' />}

                <Input.Root>
                  <Input.Label id='name' htmlFor='name'>
                    Name
                  </Input.Label>
                  <Input.Input
                    className='text-base-black py-3.5 px-3'
                    id='name'
                    name='name'
                    type='text'
                    placeholder='Felix'
                    defaultValue={me.name}
                  />
                </Input.Root>

                <Input.Root>
                  <Input.Label htmlFor='gender'>Gender</Input.Label>
                  <div className='p-1 bg-neutral-05 grid grid-cols-2 rounded-xl'>
                    <button
                      type='button'
                      className={cn(
                        'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                        gender === 'Female' ? 'bg-white' : 'bg-transparent'
                      )}
                      onClick={() => setGender('Female')}
                    >
                      👩🏻 Female
                    </button>
                    <button
                      type='button'
                      className={cn(
                        'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                        gender === 'Male' ? 'bg-white' : 'bg-transparent'
                      )}
                      onClick={() => setGender('Male')}
                    >
                      🧔🏻‍♂ Male
                    </button>
                  </div>
                  <input type='hidden' name='gender' value={gender || ''} />
                </Input.Root>

                <Textarea.Root>
                  <Textarea.Label htmlFor='character'>Character (optional)</Textarea.Label>
                  <Textarea.Wrapper>
                    <Textarea.Textarea
                      className='scrollbar-medium text-base-black min-h-24'
                      id='character'
                      name='character'
                      placeholder='Describe your avatar'
                      defaultValue={me.character}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>

                <div className='grid gap-2 mt-4'>
                  <Button.Root type='submit' disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        Next Step <Icons.chevronRight />
                      </>
                    )}
                  </Button.Root>
                </div>
              </div>
            </form>
          </div>
        )}

        {currentStep === 'Permit' && (
          <div className='flex flex-col sm:gap-6 gap-4'>
            <div className='flex flex-col items-center gap-5'>
              <Icons.iconLogo className='w-12 h-12 bg-white rounded-full p-2 border border-neutral-04 sm:w-14 sm:h-14' />
              <h3 className='sm:text-heading-h2 text-heading-h3 text-base-black text-center font-semibold'>
                Create Your First
                <br /> Token Permit
              </h3>
            </div>

            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <label className='text-body-lg text-base-black'>USDC amount</label>
                  <span className='text-heading-h2 font-bold text-base-black'>{amount.toLocaleString()}</span>
                </div>

                <div className='px-2'>
                  <Slider.Root
                    value={[selectedIndex]}
                    onValueChange={(value) => setSelectedIndex(value[0])}
                    min={0}
                    max={fibonacciAmounts.length - 1}
                    step={1}
                    className='w-full'
                  >
                    <Slider.Thumb />
                  </Slider.Root>
                </div>
              </div>

              <PermitButton
                tokenAddress={USDC_TOKEN_ADDRESS}
                tokenName={USDC_TOKEN_NAME}
                tokenVersion={USDC_TOKEN_VERSION}
                spender={SPENDER_ADDRESS}
                amount={amount.toString()}
                onSigned={handlePermitSigned}
                isPending={createTokenPermitMutation.isPending}
              />
            </div>
          </div>
        )}

        {currentStep !== 'Permit' && (
          <div className='mx-auto border border-neutral-02 p-px max-w-1/3 h-2 text-body-sm flex gap-px mt-4 -mb-2 rounded-full overflow-hidden'>
            <div className='w-1/3 bg-base-black rounded-l-full' />
            <div className={cn('w-1/3 bg-neutral-03', currentStep === 'Account' && '!bg-base-black')} />
            <div className='w-1/3 bg-neutral-03 rounded-r-full' />
          </div>
        )}
      </div>
    </div>
  );
};
