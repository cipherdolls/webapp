import { Card } from '~/components/card';
import { cn } from '~/utils/cn';
import type { User } from '~/types';
import { Icons } from './ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Button from '~/components/ui/button/button';
import { useState } from 'react';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useUpdateUser } from '~/hooks/queries/userMutations';

const YourInfo = ({ me }: { me: User }) => {
  const hasUserInfo = me.character;
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const { mutate: updateUser, error: updateUserError } = useUpdateUser();

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jsonData: Record<string, any> = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    updateUser(jsonData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <form className='w-full' onSubmit={handleUpdateUser}>
      <input name='userId' value={me.id} hidden readOnly />
      <input name='signerAddress' value={me.signerAddress} hidden readOnly />
      
      <Card.Root className='sm:pr-4'>
        <Card.Label>Your Info</Card.Label>
        <Card.Main className='max-h-max'>
          <Card.Header>
            <Card.HeaderSection>
              <button type='button' className='flex items-center gap-2 focus:outline-0' onClick={toggleEditing}>
                {hasUserInfo || isEditing ? <Icons.pen /> : <Icons.add />}
                {hasUserInfo || isEditing ? 'Edit Your Info' : 'Add Your Info'}
              </button>
            </Card.HeaderSection>
          </Card.Header>
          <Card.Content className={cn(hasUserInfo && !isEditing && 'border-t-0')}>
            {isEditing ? (
              <div className='flex flex-col shadow-regular rounded-xl sm:p-5 p-3 divide-y divide-neutral-04'>
                {/* {fetcher.data?.message && <ErrorsBox errors={fetcher.data.message} className='mb-4' />} */}
                <div className='flex flex-col sm:gap-5 gap-4 sm:py-0 py-3'>
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
                    <Input.Label id='publicName' htmlFor='publicName'>
                      Public Name
                    </Input.Label>
                    <Input.Input className='text-base-black py-3.5 px-3' type='text' placeholder='Add a public name' defaultValue={''} />
                    <span className='text-body-sm text-neutral-01'>
                      Your public name will be used on the pages of avatars you create and publish
                    </span>
                  </Input.Root>
                  <Textarea.Root>
                    <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                    <Textarea.Wrapper>
                      <Textarea.Textarea
                        className='scrollbar-medium text-base-black'
                        id='character'
                        name='character'
                        placeholder='Describe your avatar'
                        defaultValue={me.character}
                      />
                    </Textarea.Wrapper>
                  </Textarea.Root>
                  {updateUserError && <ErrorsBox errors={updateUserError} className='mb-4' />}
                  <div className='flex items-center gap-3 mt-2'>
                    <Button.Root type='button' variant='secondary' className='w-full' onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button.Root>
                    <Button.Root type='submit' className='w-full'>
                      Save Changes
                    </Button.Root>
                  </div>
                </div>
              </div>
            ) : !hasUserInfo ? (
              <div className='sm:pb-14'>
                <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                  <h1 className='sm:text-heading-h1 text-heading-h2'>🤔</h1>
                  <div className='flex flex-col sm:gap-2 gap-1'>
                    <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>Hey {me.name}</h4>
                    <p className='text-body-md text-neutral-01 sm:text-center'>Add some info to make conversations more personalized</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col bg-base-white shadow-regular rounded-xl sm:p-5 p-3 divide-y divide-neutral-04 max-h-[350px] sm:max-h-[500px] overflow-y-auto scrollbar-medium'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    {me.name && <h4 className='text-heading-h4 font-semibold text-base-black break-all'>{me.name}</h4>}
                  </div>
                  {me.character && <p className='text-body-md text-base-black break-all'>{me.character}</p>}
                </div>
              </div>
            )}
          </Card.Content>
        </Card.Main>
      </Card.Root>
    </form>
  );
};

export default YourInfo;
