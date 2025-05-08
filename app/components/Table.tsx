import React, { type TableHTMLAttributes } from 'react';
import { cn } from '~/utils/cn';
import { useNavigate } from 'react-router';

export interface TTableColumn<TData> {
  id: keyof TData;
  label: string;
  render: (data: TData, index?: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface TableProps<TData> extends TableHTMLAttributes<HTMLTableElement> {
  hideHeader?: boolean;
  wrapperClassName?: string;
  columns: Array<TTableColumn<TData>>;
  data: Array<TData>;
  bottomHelpText?: string;
  onRowClick?: (data: TData) => void;
  getRowUrl?: (data: TData) => string;
}

const Table = <TData,>({
  columns,
  data,
  wrapperClassName,
  className,
  bottomHelpText,
  hideHeader = false,
  onRowClick,
  getRowUrl,
  ...props
}: TableProps<TData>) => {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent, item: TData) => {
    // Check if the click happened on or inside the ViewButton or any interactive element
    const element = e.target as Element;
    const isExcluded =
      element.classList.contains('navigation-exclude') ||
      !!element.closest('.navigation-exclude') ||
      !!element.closest('[role="button"]') ||
      !!element.closest('button') ||
      !!element.closest('a');

    // Only navigate if it wasn't a click on an excluded element
    if (!isExcluded) {
      if (onRowClick) {
        onRowClick(item);
      } else if (getRowUrl) {
        navigate(getRowUrl(item));
      }
    }
  };

  return (
    <div className={cn('px-5', wrapperClassName)}>
      <table className={cn('w-full border-collapse border-transparent table-hover-border', className)} {...props}>
        {!hideHeader && (
          <thead>
            <tr className='border-b border-neutral-04'>
              {columns.map((column: any) => {
                const { id, label, className, headerClassName, render, ...props } = column;
                return (
                  <th
                    key={id.toString()}
                    className={cn('text-xs font-semibold text-neutral-01 py-4', headerClassName || className)}
                    {...props}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody className='divide-y divide-neutral-04'>
          {data.map((dt, index) => (
            <tr
              key={index}
              className={cn((onRowClick || getRowUrl) && 'cursor-pointer relative hover-effect transition-all duration-200')}
              onClick={(e) => (onRowClick || getRowUrl) && handleRowClick(e, dt)}
            >
              {columns.map((column: any) => {
                const { id, render, className, ...props } = column;
                return (
                  <td key={id.toString()} className={`${className} py-3.5 md:py-[18px]`} {...props}>
                    {render(dt, index)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
