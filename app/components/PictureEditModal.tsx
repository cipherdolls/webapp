import { useRef, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import * as Modal from '~/components/ui/new-modal';
import { getPicture } from '~/utils/getPicture';
import { useUploadPicture, useDeletePicture } from '~/hooks/queries/pictureMutations';

interface PictureEditModalProps {
  entityId: string;
  entityType: string;
  entityKey: string;
  entity: { id: string; picture?: string | { id: string } | null; name?: string };
  onClose: () => void;
}

export default function PictureEditModal({ entityId, entityType, entityKey, entity, onClose }: PictureEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadPicture, isPending: isUploading } = useUploadPicture();
  const { mutate: deletePicture, isPending: isDeleting } = useDeletePicture();

  const hasPicture = !!entity.picture;
  const pictureId = entity.picture && typeof entity.picture === 'object' ? entity.picture.id : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append(entityKey, entityId);
    uploadPicture(formData, {
      onSuccess: () => onClose(),
    });
  };

  const handleDelete = () => {
    if (!pictureId) return;
    deletePicture(pictureId, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal.Root defaultOpen onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Content className='max-w-md'>
        <Modal.Title>Manage Picture</Modal.Title>
        <Modal.Description className='sr-only'>Upload or delete picture</Modal.Description>
        <Modal.Body className='flex flex-col gap-6 pt-4'>
          <div className='flex flex-col items-center gap-4'>
            <div className='size-48 rounded-xl overflow-hidden bg-neutral-04 flex items-center justify-center'>
              {preview ? (
                <img src={preview} alt='Preview' className='size-full object-cover' />
              ) : hasPicture ? (
                <img
                  src={getPicture(entity, entityType, false)}
                  srcSet={getPicture(entity, entityType, true)}
                  alt={entity.name || 'Picture'}
                  className='size-full object-cover'
                />
              ) : (
                <Icons.fileUploadIcon />
              )}
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />

            <div className='flex gap-3 w-full'>
              <Button.Root
                variant='secondary'
                className='flex-1'
                onClick={() => fileInputRef.current?.click()}
              >
                {hasPicture && !preview ? 'Replace' : 'Choose File'}
              </Button.Root>

              {hasPicture && !preview && (
                <Button.Root
                  variant='secondary'
                  className='text-specials-danger'
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button.Root>
              )}
            </div>
          </div>

          {preview && (
            <div className='flex gap-3'>
              <Button.Root
                variant='secondary'
                className='flex-1'
                onClick={() => { setPreview(null); setSelectedFile(null); }}
              >
                Cancel
              </Button.Root>
              <Button.Root
                className='flex-1'
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button.Root>
            </div>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
