import type React from "react"
import { Field, type FieldProps } from "formik"

export interface TextAreaProps {
  /** The name/id of the field for Formik */
  field: string
  /** Label text to display above the textarea */
  label_text?: string
  /** Placeholder text for the textarea */
  placeholder?: string
  /** Whether the field is disabled */
  isDisabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether the field is required */
  required?: boolean
  /** Help text to display below the textarea */
  helpText?: string
  /** Maximum length for the textarea */
  maxLength?: number
  /** Minimum length for the textarea */
  minLength?: number
  /** Number of rows for the textarea */
  rows?: number
  /** Auto-complete attribute */
  autoComplete?: string
  /** Icon to display in the textarea */
  Icon?: React.ComponentType<{ className?: string }>
}

const TextArea: React.FC<TextAreaProps> = ({
  field,
  label_text,
  placeholder = "",
  isDisabled = false,
  className = "",
  required = false,
  helpText,
  maxLength,
  minLength,
  rows = 4,
  autoComplete,
  Icon
}) => {
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
              {Icon && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Icon className="textfield-icon" />
                </span>
              )}
              <textarea
                {...formikField}
                id={formikField.name}
                disabled={isDisabled}
                placeholder={placeholder}
                maxLength={maxLength}
                minLength={minLength}
                rows={rows}
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
                className={`textfield-input resize-none ${
                  meta.touched && meta.error
                    ? "textfield-input--error"
                    : meta.touched && !meta.error
                      ? "textfield-input--success"
                      : ""
                } ${isDisabled ? "textfield-input--disabled" : ""} ${className}`}
              />
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

export default TextArea
