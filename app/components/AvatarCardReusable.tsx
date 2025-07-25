import React, { createContext, useContext } from 'react';
import type { Avatar } from '~/types';
import AvatarPicture, { type AvatarPictureProps } from './AvatarPicture';
import { PICTURE_SIZE } from '~/constants';
import { cn } from '~/utils/cn';
import { Link, Form } from 'react-router';
import * as Button from '~/components/ui/button/button';

type AvatarCardContext = {
  avatar: Avatar;
};

const AvatarCardContext = createContext<AvatarCardContext | undefined>(undefined);

const useAvatarCardContext = () => {
  const context = useContext(AvatarCardContext);
  if (!context) {
    throw new Error('useAvatarCardContext must be used within a AvatarCardContext');
  }
  return context;
};

export default function AvatarCard({ avatar, children, className }: { avatar: Avatar; children: React.ReactNode; className?: string }) {
  return (
    <AvatarCardContext.Provider value={{ avatar }}>
      <div
        className={cn(
          '@container @min-[400px]:p-4 p-3 flex items-center justify-between gap-4 @min-[400px]:gap-4.5 flex-wrap [&+&]:border-t [&+&]:border-t-neutral-04 ',
          className
        )}
      >
        {children}
      </div>
    </AvatarCardContext.Provider>
  );
}

AvatarCard.Avatar = function Avatar({ sizeType = PICTURE_SIZE.semiMedium, className }: { sizeType?: string; className?: string }) {
  const { avatar } = useAvatarCardContext();
  return <AvatarPicture avatar={avatar} sizeType={sizeType} className={cn('@min-[400px]:size-20 size-14', className)} />;
};

AvatarCard.Content = function AvatarCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex-1 gap-y-1 overflow-hidden', className)}>{children}</div>;
};

AvatarCard.Name = function AvatarCardName({ className }: { className?: string }) {
  const { avatar } = useAvatarCardContext();
  return (
    <h4 className={cn('text-base-black @min-[400px]:text-heading-h4 text-body-lg font-semibold truncate', className)}>{avatar.name}</h4>
  );
};

AvatarCard.Description = function AvatarCardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('@min-[400px]:text-body-md text-body-sm text-neutral-01 truncate', className)}>{children}</p>;
};

AvatarCard.Actions = function AvatarCardActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2', className)}>{children}</div>;
};

AvatarCard.ChatButton = function AvatarCardChatButton({ onClick }: { onClick?: () => void }) {
  const { avatar } = useAvatarCardContext();

  return (
    <>
      {(avatar.chats?.length || 0) > 0 ? (
        <Button.Root size='sm' className='px-5' asChild>
          <Link to={`/chats/${avatar.chats?.[0]?.id}`} onClick={onClick}>
            Continue Chats
          </Link>
        </Button.Root>
      ) : (
        <Form method='POST' action='/chats' onSubmit={onClick}>
          <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
          {avatar.scenarios?.[0]?.id && <input hidden name='scenarioId' id='scenarioId' value={avatar.scenarios?.[0]?.id} readOnly />}
          <Button.Root type='submit' size='sm' className='px-5'>
            Start Chat
          </Button.Root>
        </Form>
      )}
    </>
  );
};
