import type { ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  label: string;
  error?: string;
  wide?: boolean;
};

export default function Field({ label, error, wide, id, name, className = "", ...rest }: Props) {
  const inputId = id ?? name;
  return (
    <div className={`field ${wide ? "field--wide" : ""}`}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        name={name}
        className={`input ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span id={`${inputId}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
