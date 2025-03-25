import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Icons } from '~/components/ui/icons';

export const AlertDialogContext = React.createContext<
  <T extends AlertAction>(params: T) => Promise<T['type'] extends 'alert' | 'confirm' ? boolean : null | string>
>(() => null!);

export type AlertAction =
  | { type: 'alert'; icon?: React.ReactNode; title: string; body?: string | React.ReactNode; cancelButton?: string }
  | {
      type: 'confirm';
      icon?: string | React.ReactNode;
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string;
    }
  | {
      type: 'prompt';
      icon?: string | React.ReactNode;
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string;
      defaultValue?: string;
      inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    }
  | { type: 'close' };

interface AlertDialogState {
  open: boolean;
  icon?: string | React.ReactNode;
  title: string;
  body: string | React.ReactNode;
  type: 'alert' | 'confirm' | 'prompt';
  cancelButton: string;
  actionButton: string;
  defaultValue?: string;
  inputProps?: React.PropsWithoutRef<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>;
}

export function alertDialogReducer(state: AlertDialogState, action: AlertAction): AlertDialogState {
  switch (action.type) {
    case 'close':
      return { ...state, open: false };
    case 'alert':
    case 'confirm':
    case 'prompt':
      return {
        ...state,
        open: true,
        ...action,
        cancelButton: action.cancelButton || (action.type === 'alert' ? 'Got it!' : 'No, Leave'),
        actionButton: ('actionButton' in action && action.actionButton) || 'Okay',
      };
    default:
      return state;
  }
}

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(alertDialogReducer, {
    open: false,
    icon: undefined,
    title: '',
    body: '',
    type: 'alert',
    cancelButton: 'No, Leave',
    actionButton: 'Okay',
  });

  const resolveRef = React.useRef<((tf: any) => void) | undefined>(undefined);

  function close() {
    dispatch({ type: 'close' });
    resolveRef.current?.(false);
  }

  function confirm(value?: string) {
    dispatch({ type: 'close' });
    resolveRef.current?.(value ?? true);
  }

  const dialog = React.useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params);

    return new Promise<T['type'] extends 'alert' | 'confirm' ? boolean : null | string>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  return (
    <AlertDialogContext.Provider value={dialog}>
      {children}
      <Dialog.Root
        open={state.open}
        onOpenChange={(open) => {
          if (!open) close();
          return;
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className='bg-neutral-02 fixed inset-0 z-40' />
          <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl  pb-9 sm:py-8 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-50'>
            {/* desktop alert close button */}
            {state.type === 'alert' && (
              <Button.Root
                type='button'
                size='icon'
                variant='white'
                onClick={close}
                className='hidden sm:flex absolute top-0 left-full ml-4.5 shadow-bottom'
              >
                <Button.Icon as={Icons.close} />
              </Button.Root>
            )}
             {/* ---- end desktop alert close button */}
            <div className='mx-auto bg-neutral-03 rounded-full w-16 h-1 sm:hidden mt-3 mb-5' aria-hidden='true' />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                confirm(event.currentTarget.prompt?.value);
              }}
            >
              <div className='flex flex-col gap-10'>
                <div className='flex flex-col gap-4.5 items-center justify-center'>
                  {state.icon && <div className='text-heading-h2 sm:text-heading-h1'>{state.icon}</div>}
                  <div className='flex flex-col gap-2'>
                    <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>{state.title}</Dialog.Title>
                    {state.body ? (
                      <Dialog.Description className='sm:text-body-lg text-base-black text-body-md text-center'>
                        {state.body}
                      </Dialog.Description>
                    ) : null}
                  </div>
                </div>

                {state.type === 'prompt' && <Input name='prompt' defaultValue={state.defaultValue} {...state.inputProps} />}

                {/* dialog footer buttons */}
                {state.type === 'alert' ? (
                  <Button.Root type='button' variant='secondary' onClick={close} className='sm:hidden'>
                    {state.cancelButton}
                  </Button.Root>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    <Button.Root type='submit' variant='secondary'>
                      {state.actionButton}
                    </Button.Root>
                    <Button.Root type='button' onClick={close}>
                      {state.cancelButton}
                    </Button.Root>
                  </div>
                )}
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AlertDialogContext.Provider>
  );
}
type Params<T extends 'alert' | 'confirm' | 'prompt'> = Omit<Extract<AlertAction, { type: T }>, 'type'> | string;

export function useConfirm() {
  const dialog = React.useContext(AlertDialogContext);

  return React.useCallback(
    (params: Params<'confirm'>) => {
      return dialog({
        ...(typeof params === 'string' ? { title: params } : params),
        type: 'confirm',
      });
    },
    [dialog]
  );
}

export function usePrompt() {
  const dialog = React.useContext(AlertDialogContext);

  return (params: Params<'prompt'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'prompt',
    });
}

export function useAlert() {
  const dialog = React.useContext(AlertDialogContext);
  return (params: Params<'alert'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'alert',
    });
}
