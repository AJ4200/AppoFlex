import type { ComponentProps } from "react";
import Icon from "./Icon";

type Props = Omit<ComponentProps<"input">, "type" | "children"> & {
  error?: string;
  children: React.ReactNode;
};

export default function Checkbox({ error, children, id, name, ...rest }: Props) {
  const inputId = id ?? name;
  return (
    <div className="field field--wide">
      <label className="check" htmlFor={inputId}>
        <input
          {...rest}
          type="checkbox"
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <span className="check-box" aria-hidden="true">
          <Icon name="check" size="0.9rem" />
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <span id={`${inputId}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
