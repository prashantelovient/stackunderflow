import { cn } from '@/utils'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Input as ShadcnInput } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { Badge as ShadcnBadge } from '@/components/ui/badge'
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardHeader as ShadcnCardHeader,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ChevronDown } from 'lucide-react'

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const shadcnVariant =
    variant === 'primary' ? 'default' :
      variant === 'danger' ? 'destructive' :
        variant === 'glass' ? 'ghost' :
          variant as any

  const shadcnSize = size === 'md' ? 'default' : size === 'icon' ? 'icon' : size

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size={shadcnSize}
      className={cn(
        "rounded-xl font-bold transition-all active:scale-95 select-none",
        variant === 'glass' && "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-foreground",
        variant === 'primary' && "shadow-lg shadow-primary/20",
        className
      )}
      disabled={disabled || loading}
      {...props as any}
    >
      {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin text-current" />}
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
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1.5">{label}</Label>}
      <div className="group relative">
        <ShadcnInput
          id={id}
          className={cn(
            "bg-muted/30 border-border/60 focus:ring-primary/20 rounded-xl h-12 transition-all text-sm px-4",
            "focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:border-primary/50",
            error && 'border-destructive/50 focus-visible:ring-destructive/30',
            className
          )}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {error && <p className="text-[10px] font-bold text-destructive ml-1.5 uppercase tracking-wider">{error}</p>}
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
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1.5">{label}</Label>}
      <div className="group relative">
        <ShadcnTextarea
          id={id}
          rows={rows}
          className={cn(
            "bg-muted/30 border-border/60 focus:ring-primary/20 rounded-xl transition-all text-sm leading-relaxed p-4",
            "focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:border-primary/50",
            error && 'border-destructive/50 focus-visible:ring-destructive/30',
            className
          )}
          {...props as any}
        />
        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {error && <p className="text-[10px] font-bold text-destructive ml-1.5 uppercase tracking-wider">{error}</p>}
    </div>
  )
}

// ---- Select ----
interface SelectProps {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  onChange?: (value: string) => void
  value?: string
  className?: string
  id?: string
}

export function Select({ label, error, options, placeholder, className, id, value, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1.5">{label}</Label>}
      <div className="relative group">
        <select
          id={id}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full bg-muted/30 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl h-12 text-sm px-4 outline-none appearance-none transition-all",
            !value && "text-muted-foreground/60",
            error && 'border-destructive/50',
            className
          )}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-card text-foreground">
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-[10px] font-bold text-destructive ml-1.5 uppercase tracking-wider">{error}</p>}
    </div>
  )
}

// ---- Badge ----
interface BadgeProps { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'outline' | 'secondary'; className?: string }
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-muted text-muted-foreground border-border/50",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    outline: "bg-transparent text-foreground border-border"
  }

  return (
    <ShadcnBadge
      variant="outline"
      className={cn(
        "px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] border transition-all",
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </ShadcnBadge>
  )
}

// ---- Card ----
interface CardProps { children: React.ReactNode; className?: string }
export function Card({ children, className }: CardProps) {
  return (
    <ShadcnCard className={cn("bg-card/60 backdrop-blur-md border-border/40 shadow-xl overflow-hidden rounded-[2rem]", className)}>
      {children}
    </ShadcnCard>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <ShadcnCardHeader className={cn("p-6 pb-2", className)}>{children}</ShadcnCardHeader>
}

export function CardContent({ children, className }: CardProps) {
  return <ShadcnCardContent className={cn("p-6", className)}>{children}</ShadcnCardContent>
}

// ---- PageHeader ----
interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode }
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
      <div className="space-y-1.5">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">{title}</h1>
        {subtitle && <p className="text-[13px] font-bold text-muted-foreground/80 max-w-2xl uppercase tracking-widest">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 animate-in slide-in-from-right-4 duration-500">{action}</div>}
    </div>
  )
}

// ---- Spinner ----
export function Spinner({ className }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <Loader2 className={cn('w-8 h-8 text-primary animate-spin opacity-40', className)} />
      <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  )
}

// ---- EmptyState ----
interface EmptyStateProps { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/10 border border-dashed border-border/60 rounded-[3rem] animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 bg-card/80 backdrop-blur-md rounded-[2rem] border border-border/40 flex items-center justify-center mb-8 text-4xl shadow-2xl shadow-primary/5 transition-transform hover:scale-110 duration-500">
        {icon || <span className="opacity-40">🔌</span>}
      </div>
      <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{title}</h3>
      {description && <p className="text-[13px] text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed font-medium">{description}</p>}
      <div className="animate-in slide-in-from-bottom-2 duration-700 delay-300">
        {action}
      </div>
    </div>
  )
}
