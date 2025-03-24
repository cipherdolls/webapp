import { Link } from 'react-router';
import { Modal } from '~/components/ui/Modal';
import AvatarCard from '~/components/AvatarCardReusable';
import type { Avatar } from '~/types';

interface AvatarSelectModalProps {
  avatars: Avatar[];
  children: React.ReactNode;
}

const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ avatars, children }) => (
  <Modal.Root>
    <Modal.Trigger asChild>{children}</Modal.Trigger>
    <Modal.Content title='Avatars'>
      {avatars.map((avatar) =>
        avatar.chats.length > 0 ? null : (
          <AvatarCard key={avatar.id} avatar={avatar} className='max-sm:!px-0'>
            <Link to={`/avatars/${avatar.id}`}>
              <AvatarCard.Avatar />
            </Link>
            <AvatarCard.Content>
              <AvatarCard.Name />
              <AvatarCard.Description>{avatar.shortDesc}</AvatarCard.Description>
            </AvatarCard.Content>
            <AvatarCard.Actions>
              <Modal.Close asChild>
                <AvatarCard.ChatButton />
              </Modal.Close>
            </AvatarCard.Actions>
          </AvatarCard>
        )
      )}
    </Modal.Content>
  </Modal.Root>
);

export default AvatarSelectModal;
