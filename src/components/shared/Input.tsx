import React, { useState } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

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

// ─── PasswordInput — eye-toggle password field ────────────────────────────────

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helpText?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}

        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={clsx(
              'input-field pr-10',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-secondary-500 mt-1">{helpText}</p>}
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
