import React, { useState } from "react"
import { Field, type FieldProps } from "formik"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export interface PasswordFieldProps {
  /** The name/id of the field for Formik */
  field: string
  /** Label text to display above the input */
  label_text?: string
  /** Placeholder text for the input */
  placeholder?: string
  /** Whether the field is disabled */
  isDisabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether the field is required */
  required?: boolean
  /** Help text to display below the input */
  helpText?: string
  /** Auto-complete attribute */
  autoComplete?: string
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  field,
  label_text,
  placeholder = "",
  isDisabled = false,
  className = "",
  required = false,
  helpText,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="textfield-container">
      {label_text && (
        <label htmlFor={field} className="textfield-label">
          {label_text}
          {required && (
            <span className="textfield-required" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <Field name={field}>
        {({ field: formikField, meta }: FieldProps) => (
          <div className="textfield-wrapper">
            <div className="relative">
              <input
                {...formikField}
                id={formikField.name}
                type={showPassword ? "text" : "password"}
                disabled={isDisabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                aria-invalid={meta.touched && meta.error ? "true" : "false"}
                aria-describedby={
                  meta.touched && meta.error
                    ? `${formikField.name}-error`
                    : helpText
                      ? `${formikField.name}-help`
                      : undefined
                }
                className={`textfield-input pr-12 ${
                  meta.touched && meta.error
                    ? "textfield-input--error"
                    : meta.touched && !meta.error
                      ? "textfield-input--success"
                      : ""
                } ${isDisabled ? "textfield-input--disabled" : ""} ${className}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isDisabled}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {meta.touched && meta.error && (
              <div id={`${formikField.name}-error`} className="textfield-error" role="alert" aria-live="polite">
                {meta.error}
              </div>
            )}

            {helpText && !meta.error && (
              <div id={`${formikField.name}-help`} className="textfield-help">
                {helpText}
              </div>
            )}
          </div>
        )}
      </Field>
    </div>
  )
}

export default PasswordField
