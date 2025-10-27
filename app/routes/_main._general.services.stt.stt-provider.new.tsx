import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.services.stt.stt-provider.new';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useCreateSttProvider } from '~/hooks/queries/sttMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New STT Provider' }];
}

export default function TtsProviderNew() {
  const navigate = useNavigate();
  const { mutate: createSttProvider, isPending, error: createSttProviderError } = useCreateSttProvider();  

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    if (preventFileOpen) {
      e.preventDefault();
      setPreventFileOpen(false);
      return;
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);

    setPreventFileOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    navigate(`${ROUTES.services}/stt`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createSttProvider(formData, {
      onSuccess: (data) => {
        handleClose();
      },
    });
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>Create STT Provider</Modal.Title>
        <Modal.Description className='sr-only'>Create STT Provider</Modal.Description>
        <form encType='multipart/form-data' className='w-full flex flex-col mt-[18px]' onSubmit={handleSubmit}>
          <Modal.Body className='flex flex-col gap-5'>
            <ErrorsBox errors={createSttProviderError} />
            <div className='flex flex-col items-center justify-center mb-10'>
              <div className='relative'>
                <label
                  className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                  onClick={handleLabelClick}
                >
                  <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                  {selectedImage !== null ? (
                    <div className='size-full'>
                      <img src={selectedImage} alt='API Provider' className='size-full object-cover rounded-lg' />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center size-full'>
                      <Icons.fileUploadIcon />
                    </div>
                  )}
                </label>
                <div className='absolute z-10 bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2'>
                  <div className='flex items-center justify-between w-full'>
                    <div
                      className='flex items-center justify-center bg-base-white shadow-bottom-level-2 rounded-full overflow-hidden'
                    >
                      {selectedImage !== null && (
                        <button type='button' className=' py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={handleTrashClick}>
                          <Icons.trash className='text-black' />
                        </button>
                      )}
                      {selectedImage &&
                        <div className='h-6 w-px bg-neutral-04'/>
                      }
                      <button type='button' className='py-2 px-5 relative z-10 duration-300 transition-opacity hover:opacity-60' onClick={() => fileInputRef.current?.click()} >
                        <Icons.fileUpload />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Input.Root>
              <Input.Label id='name' htmlFor='name'>
                Name
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Name'
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='apiKey' htmlFor='apiKey'>
                API Key
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='apiKey'
                name='apiKey'
                type='text'
                placeholder='API Key'
              />
            </Input.Root>
            <Input.Root>
              <Input.Label id='dollarPerSecond' htmlFor='dollarPerSecond'>
                Dollar per Second
              </Input.Label>
              <Input.Input
                className='text-base-black py-3.5 px-3'
                id='dollarPerSecond'
                name='dollarPerSecond'
                type='number'
                step='0.0000001'
                placeholder='0'
              />
            </Input.Root>
            <div className='flex items-center gap-2'>
              <Checkbox.Root
                className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                id='recommended'
                name='recommended'
              >
                <Checkbox.Indicator>
                  <Icons.check className='text-white size-4.5' />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                Recommended
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full'>
              Save
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
