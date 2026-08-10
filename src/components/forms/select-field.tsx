import { cn } from "@/lib/utils";

type SelectFieldProps = React.ComponentProps<"select"> & {
  label?: string;
};

export function SelectField({
  label,
  className,
  children,
  id,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground transition-colors [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
