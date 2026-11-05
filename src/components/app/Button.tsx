import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', fullWidth = false) =>
  cn(
    'app-focus inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap select-none',
    'transition-[opacity,transform,background-color,color] duration-100 ease-app-out active:scale-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    size === 'md' ? 'h-11 px-5 text-base' : 'h-9 px-3 text-sm',
    fullWidth && 'w-full',
    variant === 'primary' && 'app-primary font-semibold',
    variant === 'secondary' && 'border border-control bg-surface text-fg hover:bg-surface-raised',
    variant === 'ghost' && 'text-fg-muted hover:bg-white/5 hover:text-fg',
    variant === 'danger' && 'border border-danger/60 bg-transparent text-danger hover:bg-danger/10'
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, className, type = 'button', ...rest },
  ref
) {
  return <button ref={ref} type={type} className={cn(buttonClasses(variant, size, fullWidth), className)} {...rest} />;
});

type ButtonLinkProps = LinkProps & { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean };

export function ButtonLink({ variant = 'primary', size = 'md', fullWidth = false, className, ...rest }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, size, fullWidth), className)} {...rest} />;
}

/** Square icon-only button, 36 px hit area. Always pass an aria-label. */
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function IconButton(
  { className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'app-focus inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors duration-100 hover:bg-white/5 hover:text-fg disabled:opacity-50',
        className
      )}
      {...rest}
    />
  );
});
