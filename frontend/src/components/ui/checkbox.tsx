import * as React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label className="inline-flex items-center justify-center cursor-pointer select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`h-4 w-4 rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))] peer-checked:bg-[rgb(var(--primary))] peer-checked:border-[rgb(var(--primary))] flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--primary))] ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${className}`}
        >
          {checked && <Check className="h-3 w-3 text-white stroke-[3]" />}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
