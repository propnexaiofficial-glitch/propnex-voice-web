"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function AuthField({ label, id, className, error, type, ...props }: AuthFieldProps) {
  const fieldId = id ?? props.name;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block space-y-2">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <input 
          id={fieldId} 
          type={inputType}
          className={`auth-input w-full ${error ? "border-red-500 focus:border-red-500" : ""} ${className ?? ""}`} 
          {...props} 
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </label>
  );
}
