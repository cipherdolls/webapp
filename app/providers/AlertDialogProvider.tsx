import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import { ANIMATE_MODAL_SHOW_CENTER, ANIMATE_OVERLAY } from '~/constants';
import { motion } from 'motion/react';

export const AlertDialogContext = React.createContext<<T extends AlertAction>(params: T) => Promise<boolean>>(() => null!);

export type AlertAction =
  | {
      type: 'alert';
      icon?: React.ReactNode;
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string | { label: string; action: () => void };
    }
  | {
      type: 'confirm';
      icon?: string | React.ReactNode;
      title: string;
      body?: string | React.ReactNode;
      cancelButton?: string;
      actionButton?: string;
    }
  | { type: 'close' };

interface AlertDialogState {
  open: boolean;
  icon?: string | React.ReactNode;
  title: string;
  body: string | React.ReactNode;
  type: 'alert' | 'confirm';
  cancelButton: string;
  actionButton?: string | { label: string; action: () => void };
}

export function alertDialogReducer(state: AlertDialogState, action: AlertAction): AlertDialogState {
  switch (action.type) {
    case 'close':
      return { ...state, open: false };
    case 'alert':
    case 'confirm':
      return {
        ...state,
        open: true,
        ...action,
        cancelButton: action.cancelButton || (action.type === 'alert' ? 'Got it!' : 'No, Leave'),
        // Do not reuse previous actionButton; only use what is provided for this dialog
        actionButton: 'actionButton' in action ? action.actionButton : undefined,
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
    actionButton: undefined,
  });

  const resolveRef = React.useRef<((tf: boolean) => void) | undefined>(undefined);

  function close() {
    dispatch({ type: 'close' });
    resolveRef.current?.(false);
  }

  function confirm() {
    dispatch({ type: 'close' });
    resolveRef.current?.(true);
  }

  const dialog = React.useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params);

    return new Promise<boolean>((resolve) => {
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
          <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-[80]'>
            <motion.div
              initial={ANIMATE_OVERLAY.initial}
              animate={ANIMATE_OVERLAY.animate}
              transition={ANIMATE_OVERLAY.transition}
            >
              <div
                className='absolute  left-1/2 -translate-x-1/2
        w-[375px] h-[224px] sm:w-[480px] sm:h-[282px]
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
              />
              <div
                className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)]
        [mask-size:100%_100%,480px_282px]
        [mask-position:0_0,50%_50%]
        [mask-repeat:no-repeat]
        [mask-composite:exclude]
        '
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='282' viewBox='0 0 480 282' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='282' rx='12' fill='black'/%3E%3C/svg%3E\")",
                }}
              />
            </motion.div>
          </Dialog.Overlay>

          <Dialog.Content asChild forceMount>
            <motion.div
              initial={ANIMATE_MODAL_SHOW_CENTER.initial}
              animate={ANIMATE_MODAL_SHOW_CENTER.animate}
              transition={ANIMATE_MODAL_SHOW_CENTER.transition}
              className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl pb-9 sm:py-8 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-90'
            >
              <div className='mx-auto bg-neutral-03 rounded-full w-16 h-1 sm:hidden mt-3 mb-5' aria-hidden='true' />
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  confirm();
                }}
              >
                <div className='flex flex-col gap-10'>
                  <div className='flex flex-col gap-4.5 items-center justify-center'>
                    {state.icon && <div className='text-heading-h2 sm:text-heading-h1'>{state.icon}</div>}
                    <div className='flex flex-col gap-2'>
                      <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>{state.title}</Dialog.Title>
                      {state.body ? (
                        <Dialog.Description className='sm:text-body-lg text-base-black text-body-md text-center' asChild>
                          {typeof state.body === 'string' ? <p>{state.body}</p> : state.body}
                        </Dialog.Description>
                      ) : null}
                    </div>
                  </div>

                  <div className='flex justify-center gap-[12px]'>
                    <Button.Root
                      type='button'
                      onClick={close}
                      variant={state.actionButton ? 'secondary' : 'primary'}
                      className='w-[calc(50%-6px)]'
                    >
                      {state.cancelButton}
                    </Button.Root>
                    {state.actionButton && (
                      <Button.Root
                        type='submit'
                        className='w-[calc(50%-6px)]'
                        onClick={() => {
                          if (typeof state.actionButton === 'object') {
                            state.actionButton.action();
                          }
                        }}
                      >
                        {typeof state.actionButton === 'string' ? state.actionButton : state.actionButton.label}
                      </Button.Root>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AlertDialogContext.Provider>
  );
}

type Params<T extends 'alert' | 'confirm'> = Omit<Extract<AlertAction, { type: T }>, 'type'> | string;

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

export function useAlert() {
  const dialog = React.useContext(AlertDialogContext);
  return (params: Params<'alert'>) =>
    dialog({
      ...(typeof params === 'string' ? { title: params } : params),
      type: 'alert',
    });
}
