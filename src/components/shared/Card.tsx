import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = 'md', border = true, hover = false, className, ...props }, ref) => {
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white rounded-lg',
          border && 'border border-secondary-200 shadow-sm',
          hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'


interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-100 text-primary-700',
      secondary: 'bg-secondary-100 text-secondary-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
    }

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    }

    return (
      <span
        ref={ref}
        className={clsx('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
