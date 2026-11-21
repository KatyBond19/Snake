import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ children, variant = 'primary', ...rest }: ButtonProps): ReactElement {
  const className = variant === 'primary'
    ? 'snake-btn snake-btn--primary'
    : 'snake-btn snake-btn--secondary'

  return (
    <button className={className} {...rest}>
      {children}
    </button>
  )
}
