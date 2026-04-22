import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primary Colors (Brand) - Black-based
        primary: {
          50: '#f5f5f5',
          100: '#ebebeb',
          200: '#d6d6d6',
          300: '#c2c2c2',
          400: '#a3a3a3',
          500: '#808080',
          600: '#5a5a5a',
          700: '#353535',
          800: '#1a1a1a', // Hover
          900: '#0d0d0d', // Active
          950: '#000000', // Primary Black
        },
        // Secondary Colors - Text & Backgrounds
        secondary: {
          50: '#fafbfc',
          100: '#f7f9f9', // Secondary Background
          150: '#f1f3f5', // Muted Background
          200: '#eff3f4', // Hover Background & Light Border
          300: '#e6ecf0', // Border
          400: '#8899a6', // Muted Text
          500: '#536471', // Secondary Text
          600: '#0f1419', // Primary Text
          700: '#0f1419',
          800: '#0f1419',
          900: '#0f1419',
        },
        // Accent Colors - Blue for interactions
        accent: {
          50: '#e8f5fd',
          100: '#d0ebfb',
          200: '#a1ddf8',
          300: '#72d3f5',
          400: '#43c9f2',
          500: '#1d9bf0', // Main Accent Blue
          600: '#1a8cd8', // Hover Blue
          700: '#1774b1',
          800: '#145c8a',
          900: '#0f4563',
        },
        // Semantic Colors
        danger: {
          50: '#fde8f3',
          100: '#fcd1e7',
          200: '#faa3cf',
          300: '#f875b7',
          400: '#f6479f',
          500: '#f91880', // Danger
          600: '#e0166e', // Danger Hover
          700: '#b60d5a',
          800: '#8c0a46',
          900: '#620732',
        },
        success: {
          50: '#e6f7f1',
          100: '#cdefea',
          200: '#a0e4d7',
          300: '#73dbc3',
          400: '#46d2af',
          500: '#00ba7c', // Success
          600: '#00a870',
          700: '#009063',
          800: '#006b4a',
          900: '#004d32',
        },
        warning: {
          50: '#fffbf0',
          100: '#fff7e0',
          200: '#ffefc1',
          300: '#ffe7a3',
          400: '#ffdf84',
          500: '#ffd400', // Warning Yellow
          600: '#e6c300',
          700: '#ccb200',
          800: '#b3a100',
          900: '#998700',
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
export default config
