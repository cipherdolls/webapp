import { memo, useMemo } from 'react';
import { cn } from '~/utils/cn';

const ErrorsBox = memo(({ errors, className }: { errors?: unknown; className?: string }) => {
  const normalizedErrors = useMemo(() => {
    if (!errors) return [];
    if (Array.isArray(errors)) return errors.filter((e) => typeof e === 'string');
    if (typeof errors === 'string') return [errors];
    return ['Invalid error format'];
  }, [errors]);

  if (!normalizedErrors.length) return null;

  return (
    <div className={cn('rounded-lg bg-specials-danger/10 p-3 pl-10 pr-7', className)}>
      <ul className='flex flex-col gap-1 list-disc list-outside '>
        {normalizedErrors.map((error, index) => (
          <li key={`error-${index}-${error.slice(0, 10)}`} className='text-body-sm text-specials-danger'>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ErrorsBox;
