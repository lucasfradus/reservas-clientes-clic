import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'ghost' | 'taupe';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  fullWidth,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={`clic-btn clic-btn--${variant}${
        fullWidth ? ' clic-btn--full' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
