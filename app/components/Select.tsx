import React, { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      variant = "outlined",
      size = "md",
      disabled = false,
      required = false,
      error,
      helperText,
      options,
      className = "",
      inputClassName = "",
      labelClassName = "",
      autoFocus = false,
      name,
      id,
    },
    ref
  ) => {
    const baseInputClasses =
      "w-full font-['Urbanist'] transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer";

    const variantClasses = {
      default: "border-0 border-b-2 border-gray-300 bg-transparent focus:border-[var(--primary-blue)]",
      outlined:
        "border border-gray-300 bg-white focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-blue-100 rounded-lg",
      filled: "border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-[var(--primary-blue)] rounded-lg",
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-4 py-4 text-lg",
    };

    const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "";

    const inputClasses = `${baseInputClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${inputClassName}`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const fieldId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={fieldId} className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            className={`${inputClasses} pr-10`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <div className="mt-2">
            {error && <p className="text-sm text-red-600 font-['Urbanist']">{error}</p>}
            {!error && helperText && <p className="text-sm text-gray-500 font-['Urbanist']">{helperText}</p>}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
