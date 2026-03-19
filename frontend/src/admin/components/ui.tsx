import { cn } from '@/lib/utils'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge as ShadcnBadge } from '@/components/ui/badge'
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardHeader as ShadcnCardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const shadcnVariant =
    variant === 'primary' ? 'default' :
      variant === 'danger' ? 'destructive' :
        variant as any

  const shadcnSize = size === 'md' ? 'default' : size

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size={shadcnSize}
      className={className}
      disabled={disabled || loading}
      {...props as any}
    >
      {loading && <span className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </ShadcnButton>
  )
}

// ---- Input ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <ShadcnInput
        id={id}
        className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ---- Textarea ----
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, rows = 4, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <ShadcnTextarea
        id={id}
        rows={rows}
        className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...props as any}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ---- Select ----
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onChange?: (value: string) => void
  value?: string
}

export function Select({ label, error, options, placeholder, className, id, value, onChange, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <ShadcnSelect value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(error && 'border-red-500', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ---- Badge ----
interface BadgeProps { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'; className?: string }
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const shadcnVariant =
    variant === 'danger' ? 'destructive' :
      variant === 'info' ? 'default' :
        'secondary' // Badge has limited variants in default shadcn

  return (
    <ShadcnBadge variant={shadcnVariant as any} className={className}>
      {children}
    </ShadcnBadge>
  )
}

// ---- Card ----
interface CardProps { children: React.ReactNode; className?: string }
export function Card({ children, className }: CardProps) {
  return <ShadcnCard className={className}>{children}</ShadcnCard>
}

export function CardHeader({ children, className }: CardProps) {
  return <ShadcnCardHeader className={className}>{children}</ShadcnCardHeader>
}

export function CardContent({ children, className }: CardProps) {
  return <ShadcnCardContent className={className}>{children}</ShadcnCardContent>
}

// ---- PageHeader ----
interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode }
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ---- Spinner ----
export function Spinner({ className }: { className?: string }) {
  return <div className={cn('w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin', className)} />
}

// ---- EmptyState ----
interface EmptyStateProps { title: string; description?: string; action?: React.ReactNode }
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">📭</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
      {action}
    </div>
  )
}
