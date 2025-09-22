import * as Button from '~/components/ui/button/button';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';

const ERROR_DETAILS: Record<number | string, { message: string; emoji: string }> = {
  400: {
    message: 'Bad Request. Please check your input and try again.',
    emoji: '📝',
  },
  401: {
    message: 'Unauthorized. Please log in to continue.',
    emoji: '🔒',
  },
  403: {
    message: 'Forbidden. You do not have permission to access this resource.',
    emoji: '🔒',
  },
  404: {
    message: 'Not Found. The requested resource could not be found.',
    emoji: '🔍',
  },
  409: {
    message: 'Conflict. There was a conflict with your request.',
    emoji: '⚠️',
  },
  422: {
    message: 'Unprocessable Entity. Please check your data and try again.',
    emoji: '❗',
  },
  429: {
    message: 'Too Many Requests. Please slow down and try again later.',
    emoji: '🐢',
  },
  500: {
    message: 'Internal Server Error. Please try again later.',
    emoji: '💥',
  },
  502: {
    message: 'Bad Gateway. Please try again later.',
    emoji: '🌐',
  },
  503: {
    message: 'Service Unavailable. Please try again later.',
    emoji: '🚧',
  },
  504: {
    message: 'Gateway Timeout. Please try again later.',
    emoji: '⏳',
  },
  default: {
    message: 'Something went wrong. Please try again later.',
    emoji: '😞',
  },
};

function getErrorDetails(code?: number | string, message?: string): { message: string; emoji: string } {
  if (message && message.trim().length > 0) {
    return {
      message,
      emoji: (code !== undefined && code !== null && ERROR_DETAILS[code]?.emoji) || ERROR_DETAILS.default.emoji,
    };
  }
  if (code !== undefined && code !== null && ERROR_DETAILS[code]) {
    return ERROR_DETAILS[code];
  }
  return ERROR_DETAILS.default;
}

const ErrorPage = ({ code, message }: { code?: number | string; message?: string }) => {
  const { message: errorMessage, emoji } = getErrorDetails(code, message);
  return (
    <div className='flex items-center justify-center px-6 mx-auto'>
      <div className='w-full'>
        <div className='text-center'>
          <div className='text-center mb-4 text-[80px]'>{emoji}</div>

          {/* Error Message */}
          <div className='mb-8 rounded-lg p-2 w-full'>
            <p className='text-heading-h4 md:text-heading-h3'>{errorMessage}</p>
          </div>

          {/* Go Back Button */}
          <Button.Root variant='primary' className='min-w-[220px] px-4' asChild>
            <Link to={ROUTES.account}>Go to Dashboard</Link>
          </Button.Root>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
