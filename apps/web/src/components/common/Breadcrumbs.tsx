'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4">
      <button
        onClick={() => router.push('/dashboard/main')}
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {item.href && !isLast ? (
              <button
                onClick={() => router.push(item.href!)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
