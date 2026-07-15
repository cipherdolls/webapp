import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.groups.new';
import GroupFormModal from '~/components/GroupFormModal';
import { useCreateGroup } from '~/hooks/queries/groupMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Group - CipherDolls' }];
}

export default function GroupNew() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(ROUTES.groups);
  };

  const { mutate: createGroup, isPending, error } = useCreateGroup();

  const handleSubmit = (data: Record<string, any>) => {
    createGroup(data, {
      onSuccess: (newGroup) => {
        navigate(`${ROUTES.groups}/${newGroup.id}`);
      },
    });
  };

  return <GroupFormModal onSubmit={handleSubmit} isPending={isPending} onClose={handleClose} errors={error} />;
}
