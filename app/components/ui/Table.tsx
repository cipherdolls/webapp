import React, { type TableHTMLAttributes } from 'react';
import { cn } from '~/utils/cn';

export interface TTableColumn<TData> {
  id: keyof TData;
  label: string;
  setContent: (data: TData, index?: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface TableProps<TData> extends TableHTMLAttributes<HTMLTableElement> {
  hideHeader?: boolean;
  wrapperClassName?: string;
  columns: Array<TTableColumn<TData>>;
  data: Array<TData>;
  bottomHelpText?: string;
}

const Table = <TData,>({ columns, data, wrapperClassName, className, bottomHelpText, hideHeader = false, ...props }: TableProps<TData>) => {
  return (
    <div className={cn('px-5', wrapperClassName)}>
      <table className={cn('w-full border-collapse border-transparent', className)} {...props}>
        {!hideHeader && (
          <thead>
            <tr className='border-b border-neutral-04'>
              {columns.map((column: any) => {
                const { id, label, setContent, ...props } = column;
                return (
                  <th key={id.toString()} className='text-xs font-semibold text-neutral-01 py-4' {...props}>
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody className='divide-y divide-neutral-04'>
          {data.map((dt, index) => (
            <tr key={index}>
              {columns.map((column: any) => {
                const { id, setContent, ...props } = column;
                return (
                  <td key={id.toString()} className='py-3.5 md:py-5' {...props}>
                    {setContent(dt, index)}
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
