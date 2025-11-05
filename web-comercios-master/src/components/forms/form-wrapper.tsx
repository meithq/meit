'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface FormWrapperProps
  extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showButtons?: boolean;
  submitVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidthButtons?: boolean;
  className?: string;
  buttonsClassName?: string;
}

const FormWrapper = React.forwardRef<HTMLFormElement, FormWrapperProps>(
  (
    {
      children,
      onSubmit,
      submitLabel = 'Submit',
      cancelLabel = 'Cancel',
      onCancel,
      loading = false,
      disabled = false,
      showButtons = true,
      submitVariant = 'primary',
      fullWidthButtons = false,
      className,
      buttonsClassName,
      ...props
    },
    ref
  ) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (disabled || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await onSubmit(e);
      } finally {
        setIsSubmitting(false);
      }
    };

    const isDisabled = disabled || loading || isSubmitting;

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        {...props}
      >
        {/* Form Fields */}
        <div className="space-y-4">{children}</div>

        {/* Action Buttons */}
        {showButtons && (
          <div
            className={cn(
              'flex gap-3',
              fullWidthButtons
                ? 'flex-col sm:flex-col'
                : 'flex-col-reverse sm:flex-row sm:justify-end',
              buttonsClassName
            )}
          >
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isDisabled}
                fullWidth={fullWidthButtons}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              variant={submitVariant}
              loading={isSubmitting || loading}
              disabled={isDisabled}
              fullWidth={fullWidthButtons}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    );
  }
);

FormWrapper.displayName = 'FormWrapper';

export { FormWrapper };
