import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  const hoverStyles = onClick ? 'hover:bg-gray-50 cursor-pointer' : '';

  return (
    <tr className={`${hoverStyles} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      className={`
        px-4 py-3
        text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
        ${className}
      `}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}

// Empty state component
interface TableEmptyProps {
  message?: string;
  colSpan?: number;
}

export function TableEmpty({ message = 'Nenhum dado encontrado', colSpan = 1 }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
}
