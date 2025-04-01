import { useEffect, useRef } from 'react';
import { cn } from '~/utils/cn';

interface AutosizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

const AutosizeTextarea: React.FC<AutosizeTextareaProps> = ({ value, className, ...rest }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

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
