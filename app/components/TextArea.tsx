import React, { forwardRef } from "react";

interface TextAreaProps {
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
  rows?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      rows = 4,
      resize = "vertical",
    },
    ref
  ) => {
    const baseInputClasses =
      "w-full font-['Urbanist'] transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const fieldId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={fieldId} className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* TextArea Field */}
        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          rows={rows}
          style={{ resize }}
          className={`${inputClasses}`}
        />

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

TextArea.displayName = "TextArea";

export default TextArea;
