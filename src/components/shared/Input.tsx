import React from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}

        <input
          ref={ref}
          className={clsx(
            'input-field',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-secondary-500 mt-1">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}

        <textarea
          ref={ref}
          className={clsx(
            'input-field resize-none',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-secondary-500 mt-1">{helpText}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
