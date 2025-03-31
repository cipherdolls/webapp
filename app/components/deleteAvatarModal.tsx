import AvatarDestroy from '~/routes/avatars.$id.destroy';
import DeleteModal from './ui/deleteModal';

const DeleteAvatarModal = () => {
  return (
    <DeleteModal 
      title="Delete an Avatar?" 
      description="By deleting an avatar a chat will be deleted as well. You will no able to restore the data"
    >
      <AvatarDestroy />
    </DeleteModal>
  );
};

export default DeleteAvatarModal;