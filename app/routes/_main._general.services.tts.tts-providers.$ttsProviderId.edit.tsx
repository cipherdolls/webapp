import { useNavigate } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import type { Route } from './+types/_main._general.services.tts.tts-providers.$ttsProviderId.edit';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { useRef, useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { cn } from '~/utils/cn';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { useTtsProvider } from '~/hooks/queries/ttsQueries';
import { useUpdateTtsProvider } from '~/hooks/queries/ttsMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit TTS Provider' }];
}

export default function TtsProviderEdit({ params }: Route.ComponentProps) {
  const { data: ttsProvider, isLoading } = useTtsProvider(params.ttsProviderId);
  const { mutate: updateTtsProvider, isPending: isUpdatingTtsProvider, error: errorUpdateTtsProvider } = useUpdateTtsProvider();

  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(ttsProvider?.picture ?? null);
  const [censored, setCensored] = useState(ttsProvider?.censored ?? false);
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
    navigate(`${ROUTES.services}/tts`, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    updateTtsProvider(
      { ttsProviderId: params.ttsProviderId, formatData: formData },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Modal.Content>
        <Modal.Title>Edit TTS Provider</Modal.Title>
        <Modal.Description className='sr-only'>Edit TTS Provider</Modal.Description>
        {ttsProvider ? (
          <form onSubmit={handleSubmit} method='PATCH' encType='multipart/form-data' className='w-full flex flex-col mt-[18px]'>
            <Modal.Body className='flex flex-col gap-5'>
              <ErrorsBox errors={errorUpdateTtsProvider} />
              <input type='hidden' name='ttsProviderId' value={ttsProvider.id} />
              <div className='flex flex-col items-center justify-center mb-10'>
                <div className='relative'>
                  <label
                    className='size-40 bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
                    onClick={handleLabelClick}
                  >
                    <input ref={fileInputRef} className='hidden' type='file' name='picture' accept='image/*' onChange={handleImageChange} />
                    {selectedImage !== null ? (
                      <div className='size-full'>
                        <img
                          src={selectedImage.startsWith('blob:') ? selectedImage : getPicture(ttsProvider, 'tts-providers', false)}
                          srcSet={!selectedImage.startsWith('blob:') ? getPicture(ttsProvider, 'tts-providers', true) : undefined}
                          alt={ttsProvider.name}
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
                  defaultValue={ttsProvider.name}
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
                  placeholder='Enter new API key if you want to change it'
                />
                <input type='hidden' name='originalApiKey' value={ttsProvider.apiKey} />
              </Input.Root>
              <Input.Root>
                <Input.Label id='dollarPerCharacter' htmlFor='dollarPerCharacter'>
                  Dollar per character
                </Input.Label>
                <Input.Input
                  className='text-base-black py-3.5 px-3'
                  id='dollarPerCharacter'
                  name='dollarPerCharacter'
                  type='number'
                  step='0.0000001'
                  defaultValue={ttsProvider.dollarPerCharacter}
                />
              </Input.Root>
              <Input.Root>
                <Input.Label id='hostname' htmlFor='hostname'>
                  Hostname
                </Input.Label>
                <Input.Input
                  className='text-base-black py-3.5 px-3'
                  id='hostname'
                  name='hostname'
                  type='text'
                  defaultValue={ttsProvider.hostname}
                />
              </Input.Root>
              <div className='flex items-center gap-2'>
                <Checkbox.Root
                  className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 data-[state=checked]:bg-base-black bg-transparent outline-none focus:shadow-neutral-02'
                  id='censored'
                  checked={censored}
                  onCheckedChange={(checked) => setCensored(checked === true)}
                >
                  <Checkbox.Indicator>
                    <Icons.check className='text-white size-4.5' />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <input type='hidden' name='censored' value={censored ? 'true' : 'false'} />
                <label className='text-body-sm font-semibold text-neutral-01' htmlFor='censored'>
                  Censored
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
        ) : (
          <p className='text-body-md text-neutral-01 font-semibold text-center py-5'>Tts provider not found</p>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
