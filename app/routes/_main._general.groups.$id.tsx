import { useNavigate, useParams, Link, Outlet } from 'react-router';
import type { Route } from './+types/_main._general.groups.$id';
import { useRef, useState } from 'react';
import { useGroup } from '~/hooks/queries/groupQueries';
import { useUpdateGroup, useDeleteGroup } from '~/hooks/queries/groupMutations';
import { useUploadPicture, useDeletePicture } from '~/hooks/queries/pictureMutations';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirm, useAlert } from '~/providers/AlertDialogProvider';
import { getPicture } from '~/utils/getPicture';
import GroupFormModal from '~/components/GroupFormModal';
import ErrorPage from '~/components/ErrorPage';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import { ROUTES } from '~/constants';
import type { Avatar, Scenario } from '~/types';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Group - CipherDolls' }];
}

type PickerItem = { id: string; name: string };

function MemberPicker({
  title, items, selectedIds, onSave, onClose, isPending,
}: {
  title: string; items: PickerItem[]; selectedIds: string[];
  onSave: (ids: string[]) => void; onClose: () => void; isPending: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = useState('');
  const filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <Modal.Root defaultOpen onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Content className='overflow-y-auto flex flex-col scrollbar-medium max-h-[calc(100vh-104px)]'>
        <Modal.Title className='pb-2'>{title}</Modal.Title>
        <Modal.Description className='sr-only'>{title}</Modal.Description>
        <input
          type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search…'
          className='w-full border border-neutral-04 rounded-lg py-2.5 px-3 text-base-black mb-3'
        />
        <div className='flex flex-col gap-2 flex-1 overflow-auto scrollbar-medium min-h-40'>
          {filtered.map((item) => (
            <button
              key={item.id} onClick={() => toggle(item.id)}
              className={cn('flex items-center justify-between p-3 rounded-xl border text-left transition-colors',
                selected.has(item.id) ? 'border-base-black bg-neutral-05' : 'border-neutral-04 hover:border-neutral-02')}
            >
              <span className='font-medium text-base-black'>{item.name}</span>
              {selected.has(item.id) && <Icons.check className='w-4 h-4' />}
            </button>
          ))}
          {filtered.length === 0 && <p className='text-body-md text-neutral-01 text-center py-6'>Nothing found.</p>}
        </div>
        <Modal.Footer className='pt-5'>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>Cancel</Button.Root>
          </Modal.Close>
          <Button.Root className='w-full' disabled={isPending} onClick={() => onSave([...selected])}>
            {isPending ? 'Saving…' : 'Save'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default function GroupDetail({}: Route.ComponentProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const alert = useAlert();
  const queryClient = useQueryClient();

  const { data: group, isLoading, error } = useGroup(id!);
  const { mutate: updateGroup, isPending: isUpdating, error: updateError } = useUpdateGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();
  const { mutate: uploadPicture, isPending: isUploading } = useUploadPicture();
  const { mutate: deletePicture } = useDeletePicture();

  const { data: publishedAvatars } = useAvatars({ published: 'true', limit: '100' });
  const { data: myAvatars } = useAvatars({ mine: 'true', limit: '100' });
  const { data: publishedScenarios } = useScenarios({ published: 'true', limit: '100' });
  const { data: myScenarios } = useScenarios({ mine: 'true', limit: '100' });

  const [showEdit, setShowEdit] = useState(false);
  const [picker, setPicker] = useState<'avatars' | 'scenarios' | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (isLoading) {
    return (
      <div className='w-full flex flex-col gap-5 sm:mt-8'>
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-8 max-w-[200px]' />
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[300px] sm:h-[400px]' />
      </div>
    );
  }
  if (error || !group) return <ErrorPage code={(error as any)?.code} message={(error as any)?.message} />;

  const memberAvatarIds = (group.avatars || []).map((a) => a.id);
  const memberScenarioIds = (group.scenarios || []).map((s) => s.id);
  const uniqById = <T extends { id: string }>(arr: T[]) => Object.values(Object.fromEntries(arr.map((x) => [x.id, x])));
  const groupableAvatars = uniqById([...(publishedAvatars?.data || []), ...(myAvatars?.data || []), ...(group.avatars || [])]) as Avatar[];
  const groupableScenarios = uniqById([...(publishedScenarios?.data || []), ...(myScenarios?.data || []), ...(group.scenarios || [])]) as Scenario[];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['group', id] });

  const handleDelete = async () => {
    const ok = await confirm({
      icon: '🗑️', title: 'Delete Group?',
      body: 'The avatars and scenarios stay — only the group and its landing page are removed.',
      actionButton: 'Yes, Delete', cancelButton: 'No, Keep', variant: 'danger',
    });
    if (!ok) return;
    deleteGroup(group.id, {
      onSuccess: () => navigate(ROUTES.groups),
      onError: (e: any) => alert({ title: 'Cannot Delete', body: e?.message || 'Failed to delete this group.', actionButton: 'OK' }),
    });
  };

  const saveMembers = (kind: 'avatarIds' | 'scenarioIds', ids: string[]) =>
    updateGroup({ groupId: group.id, data: { [kind]: ids } }, { onSuccess: () => { setPicker(null); refresh(); } });

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        {/* Header */}
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={ROUTES.groups} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap hover:underline transition-all duration-200'>
              {group.name}
            </h3>
            <span className={cn('text-xs px-2 py-1 rounded', group.published ? 'bg-green-100 text-green-800' : 'bg-neutral-04 text-neutral-01')}>
              {group.published ? 'Published' : 'Draft'}
            </span>
          </Link>
          <div className='flex items-center gap-3'>
            <Button.Root variant='secondary' className='hidden sm:block' disabled={isUpdating}
              onClick={() => updateGroup({ groupId: group.id, data: { published: !group.published } }, { onSuccess: refresh })}>
              {group.published ? 'Unpublish' : 'Publish'}
            </Button.Root>
            <Button.Root variant='secondary' className='w-[100px]' onClick={() => setShowEdit(true)}>Edit</Button.Root>
            <Button.Root type='button' variant='danger' disabled={isDeleting} onClick={handleDelete}>
              <Icons.trash className='w-12' />
            </Button.Root>
          </div>
        </div>

        {/* Body */}
        <div className='flex md:flex-row flex-col-reverse gap-5 rounded-xl pb-2.5 md:gap-0 md:divide-x divide-neutral-04'>
          {/* Left — content */}
          <div className='flex flex-col gap-4 md:pr-4 w-full'>
            <div className='bg-gradient-1 rounded-xl p-5'>
              <p className='text-body-sm text-neutral-02 mb-1'>/{group.slug}</p>
              {group.title && <h4 className='text-heading-h4 text-base-black'>{group.title}</h4>}
              {group.description && <p className='text-body-md text-neutral-01 whitespace-pre-wrap mt-2'>{group.description}</p>}
            </div>

            {/* Avatars */}
            <div className='bg-gradient-1 rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-heading-h4 text-base-black'>Avatars ({memberAvatarIds.length})</h4>
                <Button.Root size='sm' variant='secondary' onClick={() => setPicker('avatars')}>
                  <Button.Icon as={Icons.add} /> Manage
                </Button.Root>
              </div>
              <div className='flex flex-wrap gap-3'>
                {(group.avatars || []).map((avatar) => (
                  <Link key={avatar.id} to={`${ROUTES.avatars}/${avatar.id}`}
                    className='flex items-center gap-2 bg-white shadow-bottom-level-1 rounded-full pl-1 pr-3 py-1 hover:shadow-bottom-level-2 transition-shadow'>
                    <img src={getPicture(avatar, 'avatars', false)} alt={avatar.name} className='w-8 h-8 rounded-full object-cover' />
                    <span className='text-body-sm font-medium text-base-black'>{avatar.name}</span>
                  </Link>
                ))}
                {memberAvatarIds.length === 0 && <p className='text-body-md text-neutral-01'>No avatars in this group yet.</p>}
              </div>
            </div>

            {/* Scenarios */}
            <div className='bg-gradient-1 rounded-xl p-5'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-heading-h4 text-base-black'>Scenarios ({memberScenarioIds.length})</h4>
                <Button.Root size='sm' variant='secondary' onClick={() => setPicker('scenarios')}>
                  <Button.Icon as={Icons.add} /> Manage
                </Button.Root>
              </div>
              <div className='flex flex-wrap gap-3'>
                {(group.scenarios || []).map((scenario) => (
                  <Link key={scenario.id} to={`${ROUTES.scenarios}/${scenario.id}`}
                    className='flex items-center gap-2 bg-white shadow-bottom-level-1 rounded-full px-3 py-1.5 hover:shadow-bottom-level-2 transition-shadow'>
                    <span className='text-body-sm font-medium text-base-black'>{scenario.name}</span>
                  </Link>
                ))}
                {memberScenarioIds.length === 0 && <p className='text-body-md text-neutral-01'>No scenarios in this group yet.</p>}
              </div>
            </div>
          </div>

          {/* Right — picture */}
          <div className='flex flex-col gap-4 md:pl-4 md:max-w-[310px] w-full'>
            <div className='relative'>
              <input ref={fileInputRef} type='file' accept='image/*' className='hidden'
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setPicturePreview(URL.createObjectURL(f)); } }} />
              <div className='sm:h-60 h-[263px] w-full bg-neutral-04 sm:bg-gradient-1 flex flex-col justify-end items-center gap-3.5 rounded-xl relative overflow-hidden'>
                {picturePreview ? (
                  <img src={picturePreview} alt='Preview' className='size-full object-cover rounded-lg' />
                ) : group.picture ? (
                  <img src={getPicture(group, 'groups', false)} srcSet={getPicture(group, 'groups', true)} alt={group.name} className='size-full object-cover rounded-lg' />
                ) : (
                  <div className='flex items-center justify-center size-full cursor-pointer hover:opacity-80 transition-opacity' onClick={() => fileInputRef.current?.click()}>
                    <Icons.fileUploadIcon />
                  </div>
                )}

                {group.picture && !picturePreview && (
                  <div className='absolute top-2 right-2 flex gap-2'>
                    <button type='button' className='size-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors' onClick={() => fileInputRef.current?.click()}>
                      <Icons.pen className='size-4' />
                    </button>
                    <button type='button' className='size-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-specials-danger text-white transition-colors'
                      onClick={() => { if (group.picture && typeof group.picture === 'object') deletePicture(group.picture.id, { onSuccess: refresh }); }}>
                      <Icons.trash className='size-4' />
                    </button>
                  </div>
                )}

                {picturePreview && (
                  <div className='absolute bottom-2 left-2 right-2 flex gap-2'>
                    <Button.Root variant='secondary' size='sm' className='flex-1 bg-white/90 backdrop-blur-sm'
                      onClick={() => { setPicturePreview(null); setSelectedFile(null); }}>Cancel</Button.Root>
                    <Button.Root size='sm' className='flex-1' disabled={isUploading}
                      onClick={() => {
                        if (!selectedFile) return;
                        const formData = new FormData();
                        formData.append('file', selectedFile);
                        formData.append('groupId', group.id);
                        uploadPicture(formData, { onSuccess: () => { setPicturePreview(null); setSelectedFile(null); refresh(); } });
                      }}>
                      {isUploading ? 'Uploading…' : 'Upload'}
                    </Button.Root>
                  </div>
                )}
              </div>
            </div>
            {/* Publish toggle on mobile (hidden in header there) */}
            <Button.Root variant='secondary' className='sm:hidden w-full' disabled={isUpdating}
              onClick={() => updateGroup({ groupId: group.id, data: { published: !group.published } }, { onSuccess: refresh })}>
              {group.published ? 'Unpublish' : 'Publish'}
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && (
        <GroupFormModal group={group} isPending={isUpdating} errors={updateError} onClose={() => setShowEdit(false)}
          onSubmit={(data) => updateGroup({ groupId: group.id, data }, { onSuccess: () => { setShowEdit(false); refresh(); } })} />
      )}
      {picker === 'avatars' && (
        <MemberPicker title='Group Avatars' items={groupableAvatars} selectedIds={memberAvatarIds} isPending={isUpdating}
          onClose={() => setPicker(null)} onSave={(ids) => saveMembers('avatarIds', ids)} />
      )}
      {picker === 'scenarios' && (
        <MemberPicker title='Group Scenarios' items={groupableScenarios} selectedIds={memberScenarioIds} isPending={isUpdating}
          onClose={() => setPicker(null)} onSave={(ids) => saveMembers('scenarioIds', ids)} />
      )}
      <Outlet />
    </>
  );
}
