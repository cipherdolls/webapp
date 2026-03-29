import { type RefObject, useEffect, useRef } from 'react';
import { cn } from '~/utils/cn';
import { useMediaQuery } from 'usehooks-ts';

interface AutosizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  value?: string;
}

const AutosizeTextarea: React.FC<AutosizeTextareaProps> = ({ textAreaRef, value,  className, ...rest }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      if (!isMobile) textAreaRef.current.focus()

      textAreaRef.current.style.height = '0px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      className={cn('resize-none w-full outline-none', className)}
      rows={1}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
};

export default AutosizeTextarea;
