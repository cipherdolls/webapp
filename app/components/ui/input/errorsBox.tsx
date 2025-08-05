import { memo, useMemo } from 'react';
import { cn } from '~/utils/cn';

// Safely try to parse a string as JSON
function tryParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Normalize any error shape to an array of strings
function normalizeErrors(errors: unknown): string[] {
  if (!errors) return [];

  // If it's already an array of strings
  if (Array.isArray(errors)) {
    return errors.filter((e) => typeof e === 'string');
  }

  // If it's a string (maybe a JSON or just text)
  if (typeof errors === 'string') {
    const parsed = tryParseJson(errors);
    if (parsed && Array.isArray(parsed)) {
      return parsed.filter((e) => typeof e === 'string');
    }
    if (parsed && typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).map((v) =>
        typeof v === 'string' ? v : JSON.stringify(v)
      );
    }
    return [errors];
  }

  // If it's an Error instance
  if (errors instanceof Error) {
    // If it has an attached apiError object
    // @ts-ignore
    if (errors.apiError) {
      // @ts-ignore
      return normalizeErrors(errors.apiError.message ?? errors.apiError);
    }
    return [errors.message];
  }

  // If it's an object with a 'message' field
  if (typeof errors === 'object' && errors !== null) {
    // @ts-ignore
    if (errors.message) {
      // @ts-ignore
      return normalizeErrors(errors.message);
    }
    // Otherwise, extract all string values from the object
    return Object.values(errors).map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
  }

  // Fallback
  return ['Unknown error format'];
}

const ErrorsBox = memo(
  ({
    errors,
    className,
  }: {
    errors?: unknown;
    className?: string;
  }) => {
    const normalizedErrors = useMemo(() => normalizeErrors(errors), [errors]);

    if (!normalizedErrors.length) return null;

    return (
      <div className={cn('rounded-lg bg-specials-danger/10 p-3 pl-10 pr-7', className)}>
        <ul className="flex flex-col gap-1 list-disc list-outside">
          {normalizedErrors.map((error, index) => (
            <li
              key={`error-${index}-${typeof error === 'string' ? error.slice(0, 10) : index}`}
              className="text-body-sm text-specials-danger"
            >
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

export default ErrorsBox;