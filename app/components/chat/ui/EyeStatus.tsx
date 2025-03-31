import { cn } from '~/utils/cn';
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState';

const eyeVariants = {
  [ChatState.Idle]: {
    bg: 'radial-gradient(43.3% 81.25% at 50% 100%, #D1DDE1 0%, #F0F3F4 100%)',
    shadow: '0px 4px 8px rgba(2, 4, 52, 0.04)',
  },
  [ChatState.userSpeaking]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(238, 150, 166, 0.8) 0%, #DC2647 100%)',
    shadow: '0px 4px 16px rgba(220, 38, 71, 0.32)',
  },
  [ChatState.avatarSpeaking]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(190, 219, 255, 0.8) 0%, #59A7E3 100%)',
    shadow: '0px 4px 16px rgba(89, 167, 227, 0.32)',
  },
  [ChatState.error]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(255, 0, 0, 0.8) 0%, #FF0000 100%)',
    shadow: 'none',
  },
  // job/process colors
  [ChatState.TtsJob]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(100, 149, 237, 0.8) 0%, #6495ED 100%)',
    shadow: '0px 4px 16px rgba(100, 149, 237, 0.32)',
  },
  [ChatState.SttJob]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(255,182,193,0.8) 0%, #FF6F61 100%)',
    shadow: '0px 4px 16px rgba(255,111,97,0.32)',
  },

  [ChatState.ChatCompletionJob]: {
    bg: 'radial-gradient(83.93% 83.93% at 50% 16.07%, rgba(190, 255, 190, 0.8) 0%, #59E36B 100%)',
    shadow: '0px 4px 16px rgba(89, 227, 107, 0.32)',
  },
} as const;

interface EyeStatusProps {
  chatState: ChatStateType;
  className?: string;
  style?: React.CSSProperties;
}

const EyeStatus: React.FC<EyeStatusProps> = ({ chatState, className, style }) => {
  const eyeVariant = eyeVariants[chatState];

  return (
    <div
      className={cn(
        'size-10 animate-eye flex-shrink-0 flex items-center justify-center rounded-full',
        {
          'animate-pulse-speak': chatState === ChatState.avatarSpeaking || chatState === ChatState.userSpeaking,
        },
        className
      )}
      style={{ background: eyeVariant.bg, boxShadow: eyeVariant.shadow, ...style }}
    >
      <svg width='22' height='20' viewBox='0 0 22 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g style={{ mixBlendMode: 'soft-light' }}>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M16.1354 3.19866L16.1354 0.439679C16.1354 0.197846 15.9211 5.16878e-07 15.6591 5.39782e-07L12.6702 8.0108e-07C12.4082 8.23983e-07 12.1939 0.197846 12.1939 0.439679L12.1939 1.61586L4.58468 1.61586C4.32273 1.61586 4.10836 1.81371 4.10836 2.05554L4.10836 4.81455C4.10836 5.05635 3.89403 5.25423 3.63204 5.25423L3.63204 5.25973L0.643145 5.25973C0.381159 5.25973 0.166827 5.45757 0.166827 5.69941L0.166827 8.45839C0.166827 8.70022 0.38116 8.89807 0.643146 8.89807L1.91758 8.89807L1.91759 15.9165C1.91759 16.1583 2.13192 16.3562 2.39391 16.3562L5.38284 16.3562C5.64479 16.3562 5.85915 16.554 5.85915 16.7958L5.86511 16.7958L5.86511 19.5603C5.86511 19.8021 6.07945 20 6.34143 20L9.33033 20C9.59231 20 9.80665 19.8021 9.80665 19.5603L9.80665 18.3843L17.4097 18.3843C17.6716 18.3843 17.886 18.1864 17.886 17.9446L17.886 15.1856C17.886 14.9438 18.1003 14.7459 18.3623 14.7459L18.3623 14.7405L21.3572 14.7405C21.6192 14.7405 21.8335 14.5426 21.8335 14.3008L21.8335 11.5418C21.8335 11.3 21.6192 11.1021 21.3572 11.1021L20.0829 11.1021L20.0829 4.07802C20.0829 3.83622 19.8686 3.63834 19.6066 3.63834L16.6177 3.63834C16.3558 3.63834 16.1414 3.4405 16.1414 3.19866L16.1354 3.19866ZM15.7127 4.07802C15.7127 3.83622 15.4984 3.63834 15.2364 3.63834L13.4026 3.63289L13.4026 5.21024C13.4026 5.45208 13.1883 5.64992 12.9263 5.64992L4.58468 5.64992C4.32273 5.64992 4.10836 5.8478 4.10836 6.0896L4.1027 7.78237L5.8115 7.78237C6.07349 7.78237 6.28782 7.98022 6.28782 8.22205L6.28782 15.922C6.28782 16.1638 6.50219 16.3616 6.76414 16.3616L8.59773 16.3673L8.59773 14.7899C8.59773 14.5481 8.81206 14.3502 9.07405 14.3502L17.4156 14.3502C17.6776 14.3502 17.8919 14.1524 17.8919 13.9105L17.8978 12.2176L16.189 12.2176C15.9271 12.2176 15.7127 12.0198 15.7127 11.7779L15.7127 4.07802Z'
            fill='white'
          />
        </g>
      </svg>
    </div>
  );
};

export default EyeStatus;
