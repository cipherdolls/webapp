import React from 'react';

// Gerekli bileşenleri simüle ediyorum
const Button = ({ children, variant = 'primary', size = 'md' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
      case 'destructive':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'primary':
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-1 px-3';
      case 'lg':
        return 'text-base py-2 px-6';
      case 'md':
      default:
        return 'text-sm py-2 px-4';
    }
  };

  return (
    <button className={`font-medium rounded-md inline-flex items-center justify-center ${getVariantClasses()} ${getSizeClasses()}`}>
      {children}
    </button>
  );
};

// Lucide ikonlarını simüle ediyorum
const ArrowLeft = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M19 12H5M12 19l-7-7 7-7' />
  </svg>
);

// PageBanner Compound Component
const PageBanner = ({ children, className = '' }) => {
  return (
    <div className={`w-full bg-white border-b border-gray-200 py-4 px-6 ${className}`}>
      <div className='container mx-auto'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>{children}</div>
      </div>
    </div>
  );
};

const PageBannerLeft = ({ children, className = '' }) => {
  return <div className={`flex items-start ${className}`}>{children}</div>;
};

const PageBannerRight = ({ children, className = '' }) => {
  return <div className={`flex items-center mt-4 md:mt-0 ${className}`}>{children}</div>;
};

const PageBannerTitle = ({ children, className = '' }) => {
  return <h1 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h1>;
};

const PageBannerDescription = ({ children, className = '' }) => {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
};

const PageBannerBackButton = ({ onClick = () => {}, label = 'Geri', className = '' }) => {
  return (
    <button onClick={onClick} className={`mr-3 flex items-center text-gray-600 hover:text-gray-900 ${className}`}>
      <ArrowLeft size={16} className='mr-1' />
      {label}
    </button>
  );
};

const PageBannerSpecificInfo = ({ children, className = '' }) => {
  return <div className={`mt-2 text-sm text-gray-700 ${className}`}>{children}</div>;
};

const PageBannerActions = ({ children, className = '' }) => {
  return <div className={`flex items-center space-x-3 ${className}`}>{children}</div>;
};

// Alt bileşenleri ana bileşene bağlama
PageBanner.Left = PageBannerLeft;
PageBanner.Right = PageBannerRight;
PageBanner.Title = PageBannerTitle;
PageBanner.Description = PageBannerDescription;
PageBanner.BackButton = PageBannerBackButton;
PageBanner.SpecificInfo = PageBannerSpecificInfo;
PageBanner.Actions = PageBannerActions;
