import { memo, useMemo } from 'react';
import { cn } from '~/utils/cn';

function tryParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

const ErrorsBox = memo(({ errors, className }: { errors?: unknown; className?: string }) => {
  const normalizedErrors = useMemo(() => {
    if (!errors) return [];
    if (Array.isArray(errors)) return errors.filter((e) => typeof e === 'string');
    if (typeof errors === 'string') {
      const parsed = tryParseJson(errors);
      if (parsed && Array.isArray(parsed)) {
        return parsed.filter((e) => typeof e === 'string');
      }
      if (parsed && typeof parsed === 'object') {
        return Object.values(parsed).map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
      }
      return [errors];
    }
    return ['Невірний формат помилки'];
  }, [errors]);

  if (!normalizedErrors.length) return null;

  return (
    <div className={cn('rounded-lg bg-specials-danger/10 p-3 pl-10 pr-7', className)}>
      <ul className='flex flex-col gap-1 list-disc list-outside '>
        {normalizedErrors.map((error, index) => (
          <li key={`error-${index}-${typeof error === 'string' ? error.slice(0, 10) : index}`} className='text-body-sm text-specials-danger'>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ErrorsBox;
