# Assets Directory

This directory contains all project assets including logos, images, and icons.

## Structure

### `/logos`
- Project logos (primary, secondary, with text, without text, etc.)
- Logo variations for different backgrounds
- Use for: branding, headers, footers

### `/images`
- General images used throughout the project
- Screenshots, illustrations, backgrounds
- Use for: banners, hero sections, illustrations

### `/icons`
- SVG and icon files for UI components
- Reusable icon components
- Use for: buttons, navigation, feature indicators

## Usage

### Importing Assets
```typescript
import Logo from '@/assets/logos/logo.svg'
import HeroImage from '@/assets/images/hero.png'
```

### In Next.js Components
```typescript
import Image from 'next/image'
import Logo from '@/assets/logos/logo.svg'

export default function Header() {
  return <Image src={Logo} alt="BusinessTalk24 Logo" />
}
```

## File Naming Conventions
- Use lowercase with hyphens: `business-talk-logo.svg`
- Be descriptive: `hero-banner-dark.png`
- Include variants: `button-icon-primary.svg`, `button-icon-hover.svg`
