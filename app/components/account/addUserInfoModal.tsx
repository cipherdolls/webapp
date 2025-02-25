import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Form, useSubmit } from 'react-router';
import { Icons } from '../ui/icons';

type IUserInfo = {
  name: string;
  public_name: string;
  describe: string;
};

interface IProps {
  className?: string;
}

export const AdduserInfoModal: React.FC<IProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          {isEmpty ? (
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-4 transition duration-300 hover:opacity-50'>
              <Icons.plus /> <span className='text-sm font-semibold'>Add Your Info</span>
            </button>
          ) : (
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-4 transition duration-300 hover:opacity-50'>
              <Icons.pencil /> <span className='text-sm font-semibold'>Edit Your Info</span>
            </button>
          )}
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-base-white backdrop-blur-lg absolute z-50 flex flex-col justify-between max-h-[552px] items-center shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl focus:outline-none sm:max-h-[562px] sm:rounded-xl sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px]'>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <Dialog.Title className='text-heading-h3 mt-1 mb-3 sm:mt-0 sm:mb-2 md:text-heading-h2'>Add Your Info</Dialog.Title>

            <UserInfoForm isDisabled={isDisabled} setIsOpen={setIsOpen} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

interface IUserInfoForm {
  isDisabled: boolean;
  setIsOpen: (open: boolean) => void;
}

const UserInfoForm: React.FC<IUserInfoForm> = ({ isDisabled, setIsOpen }) => {
  const submit = useSubmit();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setIsOpen(false);
    console.log('Form Data:', data);
  };

  return (
    <Form onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
      <div className='flex gap-3 flex-col'>
        <label className='text-neutral-01 text-sm font-semibold'>Name</label>

        <input
          name='name'
          type='text'
          placeholder='Add a name'
          className='h-12 px-3 font-normal text-body-md bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
        />
      </div>

      <div className='flex gap-3 flex-col'>
        <label className='text-neutral-01 text-sm font-semibold'>Public Name</label>

        <input
          name='nickname'
          type='text'
          placeholder='Add public name'
          className='h-12 px-3 font-normal text-body-md bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
        />

        <p className='text-sm font-normal -mt-1'>Your public name will be used on the pages of avatars you create and publish</p>
      </div>

      <div className='flex gap-3 flex-col'>
        <label className='text-neutral-01 text-sm font-semibold'>Character</label>

        <textarea
          placeholder='Describe yourself'
          className='p-3 text-body-md font-normal max-h-26 h-26 bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
          required
        />
      </div>

      <div className='w-full flex justify-center items-center gap-3 border-t border-neutral-04 rounded-xl mt-2 sm:border-t-0'>
        <Dialog.Close asChild className={'hidden sm:block'}>
          <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full md:max-w-[202px] transition duration-200 hover:bg-neutral-05'>
            Cancel
          </button>
        </Dialog.Close>

        <button
          type={'submit'}
          disabled={isDisabled}
          className='w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full md:max-w-[202px] transition duration-200 hover:text-base-white/80 disabled:bg-neutral-04 disabled:text-neutral-03 disabled:cursor-not-allowed'
        >
          Save
        </button>
      </div>
    </Form>
  );
};
