"use client";

type AuthFieldProps = React.ComponentProps<"input"> & {
  label: string;
};

export function AuthField({ label, id, className, ...props }: AuthFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="block space-y-2">
      <span className="sr-only">{label}</span>
      <input id={fieldId} className={`auth-input ${className ?? ""}`} {...props} />
    </label>
  );
}
