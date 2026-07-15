import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Textarea from '~/components/ui/input/textarea';
import ErrorsBox from '~/components/ui/input/errorsBox';
import * as Modal from '~/components/ui/new-modal';
import type { Group } from '~/types';

interface GroupFormModalProps {
  group?: Group;
  onSubmit: (data: Record<string, any>) => void;
  isPending: boolean;
  onClose: () => void;
  errors?: Error | null;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const GroupFormModal = ({ group, onSubmit, isPending, onClose, errors }: GroupFormModalProps) => {
  const isNew = !group;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {
      name: formData.get('name'),
      slug: slugify(String(formData.get('slug') || formData.get('name') || '')),
      title: formData.get('title') || undefined,
      description: formData.get('description') || undefined,
    };
    onSubmit(data);
  }

  return (
    <Modal.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Content className='overflow-y-auto flex flex-col scrollbar-medium max-h-[calc(100vh-104px)]'>
        <Modal.Title className='pb-4'>{isNew ? 'Create Group' : 'Edit Group'}</Modal.Title>
        <Modal.Description className='sr-only'>{isNew ? 'Create a new group' : 'Edit group'}</Modal.Description>
        <form onSubmit={handleSubmit} className='flex flex-col flex-1 overflow-hidden -mx-8 px-8'>
          <Modal.Body className='flex flex-col gap-4 md:gap-6 flex-1 overflow-auto scrollbar-medium -mx-8 px-8 [scrollbar-gutter:stable]'>
            <Input.Root>
              <Input.Label htmlFor='name'>Name</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='name'
                name='name'
                type='text'
                placeholder='Teachers'
                defaultValue={group?.name}
                required
              />
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='slug'>Slug (used in the group URL)</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='slug'
                name='slug'
                type='text'
                placeholder='teachers'
                defaultValue={group?.slug}
              />
            </Input.Root>

            <Input.Root>
              <Input.Label htmlFor='title'>Landing page title</Input.Label>
              <Input.Input
                className='text-base-black border border-neutral-04 py-3.5 px-3'
                id='title'
                name='title'
                type='text'
                placeholder='Learn with the best AI tutors'
                defaultValue={group?.title ?? ''}
              />
            </Input.Root>

            <Textarea.Root>
              <Textarea.Label htmlFor='description'>Description</Textarea.Label>
              <Textarea.Wrapper>
                <Textarea.Textarea
                  className='w-full border border-neutral-04 py-3.5 px-3 text-base-black scrollbar-medium'
                  id='description'
                  name='description'
                  placeholder='What is this group about?'
                  defaultValue={group?.description ?? ''}
                  rows={4}
                />
              </Textarea.Wrapper>
            </Textarea.Root>
          </Modal.Body>
          <ErrorsBox errors={errors} className='mt-3' />
          <Modal.Footer className='flex-shrink-0 pt-7'>
            <Modal.Close asChild>
              <Button.Root variant='secondary' aria-label='Close' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            <Button.Root type='submit' className='w-full' disabled={isPending}>
              {isPending ? 'Saving...' : isNew ? 'Create Group' : 'Save Group'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default GroupFormModal;
