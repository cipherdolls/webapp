// Card.tsx
import React, { Fragment } from 'react';
import { Link } from 'react-router';
import { cn } from '~/utils/cn';

interface CardRootProps {
  children: React.ReactNode;
  className?: string;
}

interface CardLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderSectionProps {
  children: React.ReactNode;
  className?: string;
  to?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardRoot: React.FC<CardRootProps> = ({ children, className }) => {
  return <div className={`flex flex-col sm:size-full sm:gap-5 gap-4 ${className}`}>{children}</div>;
};

const CardLabel: React.FC<CardLabelProps> = ({ children, className }) => {
  return <h3 className={`text-heading-h4 sm:text-heading-h3 text-base-black ${className}`}>{children}</h3>;
};

const CardMain: React.FC<CardRootProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 rounded-xl flex flex-col flex-1 ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeaderSection: React.FC<CardHeaderSectionProps> = ({ children, className, to, onClick }) => {
  const classes = `flex gap-2 text-center items-center justify-center px-2 text-body-sm font-semibold text-base-black cursor-pointer ${className}`;

  if (to) {
    return (
      <Link to={to} className={cn(classes, '')}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} type='button' className={cn(classes, '')}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
};
const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  const childrenArray = React.Children.toArray(children);
  const hasTwoSections = childrenArray.length === 2;

  if (hasTwoSections) {
    return (
      <div className={`grid grid-cols-2 py-4 divide-x divide-neutral-04 ${className}`}>
        {childrenArray.map((child, index) => (
          <Fragment key={index}>{child}</Fragment>
        ))}
      </div>
    );
  }

  return <div className='py-4 flex items-center justify-center'>{children}</div>;
};

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={`flex-1 border-t border-neutral-04 ${className}`}>{children}</div>;
};

export const Card = {
  Root: CardRoot,
  Label: CardLabel,
  Main: CardMain,
  Header: CardHeader,
  Content: CardContent,
  HeaderSection: CardHeaderSection,
};
