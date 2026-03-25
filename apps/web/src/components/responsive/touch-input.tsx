import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TouchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Input otimizado para touch em dispositivos móveis
 * - Tamanho mínimo de 44px (recomendação Apple/Google)
 * - Padding maior para facilitar toque
 * - Feedback visual claro
 */
export const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full min-h-[44px] px-4 py-3',
            'text-base', // 16px+ para evitar zoom no iOS
            'rounded-lg border border-border',
            'bg-white text-gray-900',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            'transition-all duration-200',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

TouchInput.displayName = 'TouchInput';

interface TouchTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  rows?: number;
}

/**
 * Textarea otimizada para touch
 */
export const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(
  ({ label, error, hint, rows = 4, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full min-h-[88px] px-4 py-3',
            'text-base',
            'rounded-lg border border-border',
            'bg-white text-gray-900',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            'transition-all duration-200',
            'resize-y',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

TouchTextarea.displayName = 'TouchTextarea';

interface TouchSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Select otimizado para touch
 */
export const TouchSelect = forwardRef<HTMLSelectElement, TouchSelectProps>(
  ({ label, error, hint, options, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full min-h-[44px] px-4 py-3',
            'text-base',
            'rounded-lg border border-border',
            'bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
            'transition-all duration-200',
            'appearance-none bg-no-repeat',
            'bg-[length:1.5em] bg-[right_0.5rem_center]',
            'pr-10', // Space for arrow
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

TouchSelect.displayName = 'TouchSelect';
