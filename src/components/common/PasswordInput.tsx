import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  containerClassName?: string
}

export default function PasswordInput({ label, className = '', containerClassName = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className={`relative ${containerClassName}`}>
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${className || ''}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
