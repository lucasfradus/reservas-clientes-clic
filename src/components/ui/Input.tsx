import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import './Input.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, id, className = '', ...rest },
  ref,
) {
  const inputId = id ?? `f-${rest.name}`;
  return (
    <label className={`clic-input ${className}`} htmlFor={inputId}>
      <span className="clic-input__label">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={`clic-input__field${error ? ' clic-input__field--err' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-err` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-err`} className="clic-input__err">
          {error}
        </span>
      )}
    </label>
  );
});
