import React, { forwardRef } from "react";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onEnter?: () => void;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      onEnter,
      type = "text",
      variant = "outlined",
      size = "md",
      disabled = false,
      required = false,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      inputClassName = "",
      labelClassName = "",
      maxLength,
      minLength,
      autoComplete,
      autoFocus = false,
      readOnly = false,
      name,
      id,
    },
    ref
  ) => {
    const baseInputClasses =
      "w-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const fieldId = id || name || `textfield-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={fieldId} className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={(e) => e.key == "Enter" && onEnter && onEnter()}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={`${inputClasses} ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""}`}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <div className="mt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && helperText && <p className="text-sm text-gray-500">{helperText}</p>}
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
