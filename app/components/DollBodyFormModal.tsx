import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';
import type { DollBody } from '~/types';
import { useAvatars } from '~/hooks/queries/avatarQueries';

interface DollBodyFormModalProps {
  dollBody?: DollBody;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onClose: () => void;
  errors?: Error | null;
}

const DollBodyFormModal = ({ dollBody, onSubmit, isPending, onClose, errors }: DollBodyFormModalProps) => {
  const { data: avatarsPaginated, isLoading: avatarsLoading } = useAvatars({ published: 'true', limit: '100' });
  const avatars = avatarsPaginated?.data || [];

  const [picture, setPicture] = useState<string | null>(dollBody?.picture ?? null);
  const defaultAvatarId = dollBody?.avatar?.id || '';
  const [preventFileOpen, setPreventFileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isNew = !dollBody;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPicture(imageUrl);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    if (preventFileOpen) {
      e.preventDefault();
      setPreventFileOpen(false);
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPicture(null);
    setPreventFileOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose && onClose();
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  }

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content
        className={cn(
          'overflow-y-auto flex flex-col scrollbar-medium',
          isExpanded ? 'max-w-none w-[90vw] h-screen' : 'max-h-[calc(100vh-104px)]'
        )}
      >
        <div className='flex items-center justify-between pb-4'>
          <Modal.Title>{dollBody ? 'Edit Doll Body' : 'Create Doll Body'}</Modal.Title>
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block'
            title={isExpanded ? 'Collapse modal' : 'Expand modal'}
          >
            <Icons.expand />
          </button>
        </div>
        <Modal.Description className='sr-only'>{dollBody ? 'Edit doll body' : 'Create new doll body'}</Modal.Description>
        <form onSubmit={handleSubmit} encType='multipart/form-data' className='flex flex-col flex-1 overflow-hidden -mx-8 px-8'>
          <Modal.Body
            className={cn(
              'flex gap-4 md:gap-6 flex-1 overflow-auto scrollbar-medium -mx-8 px-8 [scrollbar-gutter:stable]',
              isExpanded ? 'flex-row' : 'flex-col'
            )}
          >
            {isExpanded && (
              <div className='flex-1 flex flex-col pb-0.5'>
                <Textarea.Root className='h-full'>
                  <Textarea.Label htmlFor='description'>Description</Textarea.Label>
                  <Textarea.Wrapper className='flex-1'>
                    <Textarea.Textarea
                      id='description'
                      name='description'
                      className='block w-full border border-neutral-04 py-3.5 px-3 text-base-black h-full resize-none scrollbar-medium max-h-full'
                      placeholder='Describe the doll body'
                      defaultValue={dollBody?.description}
                      isExpanded={isExpanded}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>
              </div>
            )}

            <div
              className={cn(
                'flex flex-col gap-4 md:gap-6',
                isExpanded ? 'flex-1 pb-5 h-full -mx-4 px-4 overflow-auto scrollbar-medium' : 'w-full'
              )}
            >
            <div className={cn('flex flex-col items-center justify-center', isExpanded ? 'mb-5' : 'mb-10')}>
              <div className='relative'>
                <label
                  className='bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative size-40'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {picture !== null ? (
                    <div className='size-full'>
                      <img
                        src={picture.startsWith('blob:') ? picture : dollBody ? getPicture(dollBody, 'doll-bodies', false) : '/default-avatar.png'}
                        srcSet={!picture.startsWith('blob:') && dollBody ? getPicture(dollBody, 'doll-bodies', true) : undefined}
                        alt={dollBody?.name || 'Doll Body'}
                        className='size-full object-cover rounded-lg'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center size-full'>
                      <Icons.fileUploadIcon />
                    </div>
                  )}
                </label>
                <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                  <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full overflow-hidden'>
                      {picture !== null && (
                        <button type='button' className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={handleTrashClick}>
                          <Icons.trash className='text-black' />
                        </button>
                      )}
                      {(picture || dollBody?.picture) && <div className='h-6 w-px bg-neutral-04' />}
                      <button type='button' className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={() => fileInputRef.current?.click()}>
                        <Icons.fileUpload />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4'>
              <Input.Root>
                <Input.Label htmlFor='name'>Name</Input.Label>
                <Input.Input
                  className='text-base-black border border-neutral-04 py-3.5 px-3'
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Doll body name'
                  defaultValue={dollBody?.name}
                />
              </Input.Root>

              {!isExpanded && (
                <Textarea.Root>
                  <Textarea.Label htmlFor='description'>Description</Textarea.Label>
                  <Textarea.Wrapper>
                    <Textarea.Textarea
                      className='w-full border border-neutral-04 py-3.5 px-3 text-base-black scrollbar-medium'
                      id='description'
                      name='description'
                      placeholder='Describe the doll body'
                      defaultValue={dollBody?.description}
                      rows={4}
                    />
                  </Textarea.Wrapper>
                </Textarea.Root>
              )}

              <Select.Root name='avatarId' key={`${defaultAvatarId}-${avatarsLoading}`} defaultValue={defaultAvatarId}>
                <Select.Label>Avatar</Select.Label>
                <Select.Trigger>
                  <Select.Value placeholder={avatarsLoading ? 'Loading avatars...' : 'Select an avatar'} />
                </Select.Trigger>
                <Select.Content className='max-h-[250px] overflow-y-auto'>
                  {avatars.map((avatar) => (
                    <Select.Item key={avatar.id} value={avatar.id}>
                      {avatar.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            </div>
          </Modal.Body>
          <ErrorsBox errors={errors} className='mt-3' />
          <Modal.Footer className={cn('flex-shrink-0 pt-7')}>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full'>
              {isNew ? 'Create Doll Body' : 'Save Doll Body'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default DollBodyFormModal;
