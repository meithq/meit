import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 resize-y',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400',
        error: 'border-semantic-error focus-visible:ring-semantic-error',
        success: 'border-semantic-success focus-visible:ring-semantic-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  success?: boolean;
  showCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      error,
      success,
      showCount = false,
      autoResize = false,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Determine variant based on error/success props
    const computedVariant = error
      ? 'error'
      : success
        ? 'success'
        : variant || 'default';

    // Handle auto-resize
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Handle character count
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            textareaVariants({ variant: computedVariant, className }),
            showCount && maxLength && 'pb-8'
          )}
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {showCount && maxLength && (
          <div
            className="absolute bottom-2 right-3 text-xs text-neutral-500"
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
