import { useNavigate, useParams } from 'react-router';
import type { Route } from './+types/_main._general.groups.$id';
import { useRef, useState } from 'react';
import { useGroup } from '~/hooks/queries/groupQueries';
import { useUpdateGroup, useDeleteGroup } from '~/hooks/queries/groupMutations';
import { useUploadPicture } from '~/hooks/queries/pictureMutations';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { getPicture } from '~/utils/getPicture';
import GroupFormModal from '~/components/GroupFormModal';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import { ROUTES } from '~/constants';
import type { Avatar, Scenario } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Group - CipherDolls' }];
}

type PickerItem = { id: string; name: string; published?: boolean };

function MemberPicker({
  title,
  items,
  selectedIds,
  onSave,
  onClose,
  isPending,
}: {
  title: string;
  items: PickerItem[];
  selectedIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Content className='overflow-y-auto flex flex-col scrollbar-medium max-h-[calc(100vh-104px)]'>
        <Modal.Title className='pb-2'>{title}</Modal.Title>
        <Modal.Description className='sr-only'>{title}</Modal.Description>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search...'
          className='w-full border border-neutral-04 rounded-lg py-2.5 px-3 text-base-black mb-3'
        />
        <div className='flex flex-col gap-2 flex-1 overflow-auto scrollbar-medium min-h-40'>
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-colors',
                selected.has(item.id) ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-02'
              )}
            >
              <span className='font-medium text-base-black'>{item.name}</span>
              {selected.has(item.id) && <Icons.check className='w-4 h-4 text-blue-500' />}
            </button>
          ))}
          {filtered.length === 0 && <p className='text-body-md text-neutral-01 text-center py-6'>Nothing found.</p>}
        </div>
        <Modal.Footer className='pt-5'>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>
              Cancel
            </Button.Root>
          </Modal.Close>
          <Button.Root className='w-full' disabled={isPending} onClick={() => onSave([...selected])}>
            {isPending ? 'Saving...' : 'Save'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const { data: group, isLoading } = useGroup(id!);
  const { mutate: updateGroup, isPending: isUpdating, error: updateError } = useUpdateGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();
  const { mutate: uploadPicture, isPending: isUploading } = useUploadPicture();

  const { data: publishedAvatars } = useAvatars({ published: 'true', limit: '100' });
  const { data: myAvatars } = useAvatars({ mine: 'true', limit: '100' });
  const { data: publishedScenarios } = useScenarios({ published: 'true', limit: '100' });
  const { data: myScenarios } = useScenarios({ mine: 'true', limit: '100' });

  const [showEdit, setShowEdit] = useState(false);
  const [picker, setPicker] = useState<'avatars' | 'scenarios' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading || !group) {
    return (
      <div className='w-full flex items-center justify-center py-20'>
        <div className='rounded-xl bg-neutral-04 w-full max-w-2xl animate-pulse h-[400px]' />
      </div>
    );
  }

  const memberAvatarIds = (group.avatars || []).map((a) => a.id);
  const memberScenarioIds = (group.scenarios || []).map((s) => s.id);

  // Groupable = published or your own
  const groupableAvatars: PickerItem[] = Object.values(
    Object.fromEntries(
      [...(publishedAvatars?.data || []), ...(myAvatars?.data || []), ...(group.avatars || [])].map((a) => [a.id, a])
    )
  ) as Avatar[];
  const groupableScenarios: PickerItem[] = Object.values(
    Object.fromEntries(
      [...(publishedScenarios?.data || []), ...(myScenarios?.data || []), ...(group.scenarios || [])].map((s) => [s.id, s])
    )
  ) as Scenario[];

  const refreshGroup = () => queryClient.invalidateQueries({ queryKey: ['group', id] });

  const handleDelete = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete Group?',
      body: 'The avatars and scenarios stay — only the group and its landing page go away.',
      actionButton: 'Yes, Delete',
    });
    if (!confirmResult) return;
    deleteGroup(group.id, {
      onSuccess: () => navigate(ROUTES.groups),
    });
  };

  return (
    <div className='w-full pb-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row gap-5 sm:mt-8 mb-6'>
        <div className='relative sm:w-[280px] h-[200px] rounded-xl bg-black overflow-hidden shrink-0'>
          <img
            src={getPicture(group, 'groups', false)}
            srcSet={getPicture(group, 'groups', true)}
            alt={`${group.name} picture`}
            className='object-cover size-full'
          />
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('file', file);
              formData.append('groupId', group.id);
              uploadPicture(formData, { onSuccess: refreshGroup });
              e.target.value = '';
            }}
          />
          <Button.Root
            variant='secondary'
            size='sm'
            className='absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm'
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Uploading...' : 'Change Picture'}
          </Button.Root>
        </div>

        <div className='flex flex-col gap-1 flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-semibold truncate'>{group.name}</h2>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded',
                group.published ? 'bg-green-100 text-green-800' : 'bg-neutral-04 text-neutral-01'
              )}
            >
              {group.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <p className='text-sm text-neutral-01'>/{group.slug}</p>
          {group.title && <p className='text-lg text-base-black mt-1'>{group.title}</p>}
          {group.description && <p className='text-body-md text-neutral-01'>{group.description}</p>}

          <div className='flex flex-wrap gap-2 mt-auto pt-4'>
            <Button.Root size='sm' variant='secondary' onClick={() => setShowEdit(true)}>
              Edit
            </Button.Root>
            <Button.Root
              size='sm'
              variant='secondary'
              disabled={isUpdating}
              onClick={() => updateGroup({ groupId: group.id, data: { published: !group.published } })}
            >
              {group.published ? 'Unpublish' : 'Publish'}
            </Button.Root>
            <Button.Root size='sm' variant='secondary' className='text-specials-danger' disabled={isDeleting} onClick={handleDelete}>
              Delete
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Avatars */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-xl font-semibold'>Avatars ({memberAvatarIds.length})</h3>
        <Button.Root size='sm' variant='secondary' onClick={() => setPicker('avatars')}>
          <Button.Icon as={Icons.add} />
          Manage
        </Button.Root>
      </div>
      <div className='flex flex-wrap gap-3 mb-8'>
        {(group.avatars || []).map((avatar) => (
          <div key={avatar.id} className='flex items-center gap-2 bg-white shadow-bottom-level-1 rounded-full pl-1 pr-3 py-1'>
            <img
              src={getPicture(avatar, 'avatars', false)}
              alt={avatar.name}
              className='w-8 h-8 rounded-full object-cover'
            />
            <span className='text-sm font-medium text-base-black'>{avatar.name}</span>
          </div>
        ))}
        {memberAvatarIds.length === 0 && <p className='text-body-md text-neutral-01'>No avatars in this group yet.</p>}
      </div>

      {/* Scenarios */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-xl font-semibold'>Scenarios ({memberScenarioIds.length})</h3>
        <Button.Root size='sm' variant='secondary' onClick={() => setPicker('scenarios')}>
          <Button.Icon as={Icons.add} />
          Manage
        </Button.Root>
      </div>
      <div className='flex flex-wrap gap-3'>
        {(group.scenarios || []).map((scenario) => (
          <div key={scenario.id} className='flex items-center gap-2 bg-white shadow-bottom-level-1 rounded-full px-3 py-1.5'>
            <span className='text-sm font-medium text-base-black'>{scenario.name}</span>
          </div>
        ))}
        {memberScenarioIds.length === 0 && <p className='text-body-md text-neutral-01'>No scenarios in this group yet.</p>}
      </div>

      {/* Modals */}
      {showEdit && (
        <GroupFormModal
          group={group}
          isPending={isUpdating}
          errors={updateError}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) =>
            updateGroup(
              { groupId: group.id, data },
              {
                onSuccess: () => {
                  setShowEdit(false);
                  refreshGroup();
                },
              }
            )
          }
        />
      )}

      {picker === 'avatars' && (
        <MemberPicker
          title='Group Avatars'
          items={groupableAvatars}
          selectedIds={memberAvatarIds}
          isPending={isUpdating}
          onClose={() => setPicker(null)}
          onSave={(ids) =>
            updateGroup(
              { groupId: group.id, data: { avatarIds: ids } },
              {
                onSuccess: () => {
                  setPicker(null);
                  refreshGroup();
                },
              }
            )
          }
        />
      )}

      {picker === 'scenarios' && (
        <MemberPicker
          title='Group Scenarios'
          items={groupableScenarios}
          selectedIds={memberScenarioIds}
          isPending={isUpdating}
          onClose={() => setPicker(null)}
          onSave={(ids) =>
            updateGroup(
              { groupId: group.id, data: { scenarioIds: ids } },
              {
                onSuccess: () => {
                  setPicker(null);
                  refreshGroup();
                },
              }
            )
          }
        />
      )}
    </div>
  );
}
