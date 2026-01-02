import type React from "react"
import { Field, type FieldProps } from "formik"
import { useState, useRef, useEffect } from "react"

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface DropdownProps {
  /** The name/id of the field for Formik */
  field: string
  /** Label text to display above the dropdown */
  label_text?: string
  /** Placeholder text for the dropdown */
  placeholder?: string
  /** Array of options for the dropdown */
  options: DropdownOption[]
  /** Whether the field is disabled */
  isDisabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether the field is required */
  required?: boolean
  /** Help text to display below the dropdown */
  helpText?: string
  /** Whether to show a search input in the dropdown */
  searchable?: boolean
  /** Custom empty state message */
  emptyMessage?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  field,
  label_text,
  placeholder = "Select an option",
  options,
  isDisabled = false,
  className = "",
  required = false,
  helpText,
  searchable = false,
  emptyMessage = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

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
        {({ field: formikField, meta, form }: FieldProps) => (
          <div className="textfield-wrapper">
            <div ref={dropdownRef} className="dropdown-container">
              <button
                type="button"
                id={formikField.name}
                disabled={isDisabled}
                aria-invalid={meta.touched && meta.error ? "true" : "false"}
                aria-describedby={
                  meta.touched && meta.error
                    ? `${formikField.name}-error`
                    : helpText
                      ? `${formikField.name}-help`
                      : undefined
                }
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-labelledby={label_text ? `${field}-label` : undefined}
                className={`dropdown-trigger ${
                  meta.touched && meta.error
                    ? "dropdown-trigger--error"
                    : meta.touched && !meta.error
                      ? "dropdown-trigger--success"
                      : ""
                } ${isDisabled ? "dropdown-trigger--disabled" : ""} ${className}`}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
              >
                <span className="dropdown-value">
                  {formikField.value
                    ? options.find(option => option.value === formikField.value)?.label || formikField.value
                    : placeholder}
                </span>
                <svg
                  className={`dropdown-arrow ${isOpen ? "dropdown-arrow--open" : ""}`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 8L10 12L14 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="dropdown-menu" role="listbox">
                  {searchable && (
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search options..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="dropdown-search-input"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="dropdown-options">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={formikField.value === option.value}
                          disabled={option.disabled}
                          className={`dropdown-option ${
                            formikField.value === option.value ? "dropdown-option--selected" : ""
                          } ${option.disabled ? "dropdown-option--disabled" : ""}`}
                          onClick={() => {
                            if (!option.disabled) {
                              form.setFieldValue(field, option.value)
                              setIsOpen(false)
                              setSearchTerm("")
                            }
                          }}
                        >
                          {option.label}
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-empty">{emptyMessage}</div>
                    )}
                  </div>
                </div>
              )}
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

export default Dropdown
