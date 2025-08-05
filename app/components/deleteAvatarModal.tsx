import { useDeleteAvatar } from '~/hooks/queries/avatarMutations';
import { useNavigate } from 'react-router';

import * as Button from './ui/button/button';
import DeleteModal from './ui/deleteModal';

const DeleteAvatarModal = ({ dropdown, avatarId }: { dropdown?: boolean, avatarId: string }) => {
  const { mutate: deleteAvatar } = useDeleteAvatar();
  const navigate = useNavigate();
        
  const handleDeleteAvatar = () => {
      deleteAvatar(avatarId, {
        onSuccess: () => {
          navigate(`/avatars?mine=true`); 
        },
      });
  };

  return (
    <DeleteModal
      title='Delete an Avatar?'
      description='By deleting an avatar a chat will be deleted as well. You will no able to restore the data'
      dropdown={dropdown}
    >
       <Button.Root type='button' variant='danger' className='w-full' onClick={handleDeleteAvatar}>
        Yes, delete
      </Button.Root>
    </DeleteModal>
  )
}
export default DeleteAvatarModal;
