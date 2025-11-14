import { forwardRef, type ReactNode } from 'react';
import * as Button from '~/components/ui/button/button';
import { cn, cnExt } from '~/utils/cn';
import { useLoginModal } from '~/context/login-modal-context';

type LoginButtonProps = Omit<React.ComponentProps<typeof Button.Root>, 'children' | 'onClick'> & {
  label?: string;
  icon?: ReactNode;
  children?: ReactNode;
  withDefaultStyles?: boolean;
};

const DEFAULT_CLASSNAME = 'px-10 gradient-move font-medium gap-2';

const LoginButton = forwardRef<HTMLButtonElement, LoginButtonProps>(
  ({ label = 'Log in', icon, children, className, withDefaultStyles = true, variant, size, disabled, ...rest }, ref) => {
    const { open } = useLoginModal();

    const handleClick = () => {
      if (disabled) {
        return;
      }

      open();
    };

    const finalChildren =
      children ?? (icon ? (
          <>
            <span className='font-medium'>{label}</span>
            {icon}
          </>
        ) : (
          <span className='font-medium'>{label}</span>
        ));

    return (
      <Button.Root
        ref={ref}
        className={cnExt(withDefaultStyles ? DEFAULT_CLASSNAME : undefined, className)}
        variant={variant ?? 'secondary'}
        size={size ?? 'lg'}
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        {finalChildren}
      </Button.Root>
    );
  }
);

LoginButton.displayName = 'LoginButton';

export default LoginButton;

