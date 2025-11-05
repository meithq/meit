import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-neutral-200',
  {
    variants: {
      variant: {
        default: 'bg-neutral-200',
        lighter: 'bg-neutral-100',
        darker: 'bg-neutral-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  shape?: 'text' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant,
      shape = 'rectangle',
      width,
      height,
      style,
      ...props
    },
    ref
  ) => {
    const shapeStyles = React.useMemo(() => {
      const baseStyle = { ...style };

      if (width) {
        baseStyle.width = typeof width === 'number' ? `${width}px` : width;
      }

      if (height) {
        baseStyle.height = typeof height === 'number' ? `${height}px` : height;
      }

      return baseStyle;
    }, [width, height, style]);

    const shapeClasses = React.useMemo(() => {
      switch (shape) {
        case 'text':
          return 'h-4 w-full';
        case 'circle':
          return 'rounded-full aspect-square';
        case 'rectangle':
        default:
          return 'w-full';
      }
    }, [shape]);

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), shapeClasses, className)}
        style={shapeStyles}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Preset skeleton components for common patterns
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>((props, ref) => <Skeleton ref={ref} shape="text" {...props} />);

SkeletonText.displayName = 'SkeletonText';

const SkeletonCircle = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>((props, ref) => <Skeleton ref={ref} shape="circle" {...props} />);

SkeletonCircle.displayName = 'SkeletonCircle';

const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>((props, ref) => (
  <Skeleton ref={ref} shape="circle" width={40} height={40} {...props} />
));

SkeletonAvatar.displayName = 'SkeletonAvatar';

const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-3 rounded-lg border border-neutral-200 p-6', className)}
    {...props}
  >
    <Skeleton height={20} width="60%" />
    <Skeleton height={16} width="100%" />
    <Skeleton height={16} width="80%" />
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonAvatar,
  SkeletonCard,
  skeletonVariants,
};
