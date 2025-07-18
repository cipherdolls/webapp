import { showToast } from './ui/toast';
import { useUserEvents } from '~/hooks/useUserEvents';
import type { User } from '~/types';
import { Icons } from './ui/icons';

const UserEventsToast = ({ user }: { user: User }) => {
  useUserEvents(user.id, {
    onProcessEvent: (processEvent) => {

      if(processEvent.resourceName === 'User') return;

      const { resourceName, resourceId, jobName, jobStatus } = processEvent;

      let icon = <Icons.loader className='w-8 h-8 animate-spin' />;
      let duration = 5000;
      let actionLink;
      let description = 'Process has begun...';

      if (jobStatus === 'completed') {
        // emoji = '✅';
        icon = <Icons.thumb className='w-8 h-8 text-specials-success' />;
        duration = 5000;
        description = 'Process finished successfully.';
      } else if (jobStatus === 'failed') {
        // emoji = '❌';
        icon = <Icons.warning className='w-8 h-8 text-specials-danger' />;
        description = 'Process failed.';
        duration = 8000;

        switch (resourceName) {
          case 'Avatar':
            actionLink = `/avatars/${resourceId}`;
            break;
          case 'Chat':
            actionLink = `/chats/${resourceId}`;
            break;

          default:
            break;
        }
      }

      const formattedResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
      const formattedJobName = jobName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      const formattedJobStatus = `${jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)} (ID: ${resourceId})`;

      showToast({
        toastId: `process-event-${resourceId}`,
        icon,
        title: `${formattedResourceName} ${formattedJobName}`,
        description: `${description ? description : formattedJobStatus}`,
        actionLink,
        actionText: actionLink ? 'View' : undefined,
        duration,
      });
    },
  });
  return null;
}

export default UserEventsToast