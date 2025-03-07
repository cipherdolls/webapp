import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Button from '~/components/ui/button/button';
import { useState, useEffect } from 'react';

const AddYourInfoModal = ({
  userInfo,
  setUserInfo,
}: {
  userInfo: { name: string; publicName: string; character: string };
  setUserInfo: (info: { name: string; publicName: string; character: string }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: userInfo.name || '',
    publicName: userInfo.publicName || '',
    character: userInfo.character || '',
  });

  // Update form data when userInfo changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: userInfo.name || '',
      publicName: userInfo.publicName || '',
      character: userInfo.character || '',
    }));
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Update the parent state with new values
    setUserInfo({
      name: formData.name,
      publicName: formData.publicName,
      character: formData.character,
    });

    // Close the modal
    setOpen(false);
  };

  const hasInfo = userInfo.name || userInfo.publicName || userInfo.character;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className='flex items-center gap-2 focus:outline-0'>
          {hasInfo ? <Icons.pen /> : <Icons.add />}
          {hasInfo ? 'Edit Your Info' : 'Add Your Info'}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='bg-neutral-02 fixed inset-0 pointer-events-none' />
        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 sm:max-w-[480px] w-full bg-white h-auto sm:rounded-xl shadow-bottom-level-2 sm:p-8 pt-4 pb-4.5 px-4.5'>
          <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>Edit Your Info</Dialog.Title>
          <div className='flex flex-col sm:gap-10 gap-4.5 sm:mt-4.5 mt-3'>
            <div className='flex flex-col sm:gap-5 gap-4 sm:py-0 py-3'>
              <Input.Root>
                <Input.Label id='name' htmlFor='name'>
                  Name
                </Input.Label>
                <Input.Input
                  className='text-base-black bg-neutral-05 py-3.5 px-3'
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Felix'
                  value={formData.name}
                  onChange={handleChange}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label id='publicName' htmlFor='publicName'>
                  Public Name
                </Input.Label>
                <Input.Input
                  className='text-base-black bg-neutral-05 py-3.5 px-3'
                  id='publicName'
                  name='publicName'
                  type='text'
                  placeholder='Add a public name'
                  value={formData.publicName}
                  onChange={handleChange}
                />
                <span className='text-body-sm text-neutral-01'>
                  Your public name will be used on the pages of avatars you create and publish
                </span>
              </Input.Root>
              <Textarea.Root>
                <Textarea.Label htmlFor='character'>Character</Textarea.Label>
                <Textarea.Wrapper>
                  <Textarea.Textarea
                    className='scrollbar-medium text-base-black bg-neutral-05'
                    id='character'
                    name='character'
                    placeholder='Describe your avatar'
                    value={formData.character}
                    onChange={handleChange}
                  />
                </Textarea.Wrapper>
              </Textarea.Root>
            </div>
            <div className='flex items-center gap-3'>
              <Dialog.Close asChild>
                <Button.Root variant='secondary' className='w-full sm:block hidden'>
                  Cancel
                </Button.Root>
              </Dialog.Close>
              <Button.Root className='w-full' onClick={handleSubmit}>
                Save Changes
              </Button.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddYourInfoModal;
