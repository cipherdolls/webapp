import { Link, useFetcher } from 'react-router';

import * as Popover from '~/components/ui/popover';
import { cn } from '~/utils/cn';
import type { ReactNode } from 'react';
import { Icons } from './components/ui/icons';
import SelectAvatarModal from '~/components/SelectAvatarModal';
import type { Avatar, Scenario } from '~/types';

type PopoverActionItem = {
  text: string;
  isDelete?: boolean;
  visible?: boolean;
  icon?: React.ComponentType<any>;
} & (
  | {
      type: 'link';
      href: string;
    }
  | {
      type: 'onClick';
      onClick: () => void;
    }
  | {
      type: 'form';
      action: string;
      method?: 'POST' | 'PUT' | 'DELETE';
      formData?: Record<string, string | string[]>;
    }
  | {
      type: 'component';
      component: ReactNode;
    }
  | {
      type: 'addToChat';
      allAvatars: Avatar[];
      scenario: Scenario;
    }
);

type ViewMoreProps = {
  userId?: string;
  popoverItems: PopoverActionItem[];
  className?: string;
  isDataCard?: boolean;
  visible?: boolean;
  withIcon?: boolean;
  iconClassName?: string;
  menuName?: string;
};

export const ViewMore = ({ userId, popoverItems, className, isDataCard, visible, withIcon, iconClassName, menuName }: ViewMoreProps) => {
  const fetcher = useFetcher();

  const handleFormSubmit = (item: Extract<PopoverActionItem, { type: 'form' }>) => {
    const formData = new FormData();

    if (item.formData) {
      Object.entries(item.formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });
    }

    fetcher.submit(formData, {
      method: item.method || 'POST',
      action: item.action,
    });
  };

  const renderPopoverItem = (item: PopoverActionItem, index: number) => {
    const baseClassName = `cursor-pointer w-full py-3.5 px-3 navigation-exclude text-left ${
      item.isDelete ? 'hover:bg-specials-danger/10 text-specials-danger' : 'hover:bg-neutral-05 text-base-black'
    } bg-white transition-colors text-body-md font-semibold rounded-[10px] ${withIcon ? 'flex items-center gap-2' : ''}`;

    const renderContent = (text: string) => (
      <>
        {withIcon && item.icon && <item.icon className={cn('w-6 h-6', iconClassName)} />}
        {text}
      </>
    );

    switch (item.type) {
      case 'link':
        return (
          <Popover.Close key={index} asChild unstyled>
            <Link to={item.href} className={baseClassName}>
              {renderContent(item.text)}
            </Link>
          </Popover.Close>
        );

      case 'onClick':
        return (
          <button key={index} onClick={item.onClick} className={baseClassName} type='button'>
            {renderContent(item.text)}
          </button>
        );

      case 'form':
        return (
          <button key={index} onClick={() => handleFormSubmit(item)} className={baseClassName} type='button'>
            {renderContent(item.text)}
          </button>
        );

      case 'component':
        return <div key={index}>{item.component}</div>;

      case 'addToChat':
        return (
          <SelectAvatarModal
            avatars={item.allAvatars}
            scenario={item.scenario}
            triggerContent={
              <button className={baseClassName} type='button'>
                {renderContent(item.text)}
              </button>
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger className={cn('group navigation-exclude', className)}>
        <Icons.more className='text-pink-01 group-hover:text-base-black transition-colors' />
        {menuName && <span className='text-label font-semibold'>{menuName}</span>}
      </Popover.Trigger>
      <Popover.Content side='bottom' align='end' className='flex flex-col navigation-exclude'>
        {popoverItems.filter((item) => item.visible !== false).map(renderPopoverItem)}
      </Popover.Content>
    </Popover.Root>
  );
};
