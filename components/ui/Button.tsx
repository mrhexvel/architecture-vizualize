import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'full'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	fullWidth?: boolean
}

export const Button = ({
	variant = 'primary',
	size = 'md',
	fullWidth = false,
	className = '',
	children,
	...props
}: ButtonProps) => {
	const classes = [
		'btn',
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth && 'btn--full-width',
		className
	]
		.filter(Boolean)
		.join(' ')

	return (
		<button
			type="button"
			className={classes}
			{...props}
		>
			{children}
		</button>
	)
}
