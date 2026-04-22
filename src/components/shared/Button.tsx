import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className, children, disabled, ...props },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300',
      outline: 'border border-secondary-300 text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
    }

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
