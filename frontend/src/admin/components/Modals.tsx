import { useState, useCallback, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle2, Info, AlertOctagon, Terminal, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from './ui'
import { cn } from '@/utils'

// ---- Confirm Modal ----
interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Authorize', cancelLabel = 'Abort',
  variant = 'danger', loading, onConfirm, onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onCancel} />
      <div className="relative bg-card/60 backdrop-blur-2xl border border-border/50 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] max-w-md w-full p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center text-center gap-6">
          <div className={cn('w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-2xl',
            variant === 'danger'
              ? 'bg-destructive/10 text-destructive shadow-destructive/20 border border-destructive/20'
              : 'bg-primary/10 text-primary shadow-primary/20 border border-primary/20'
          )}>
            {variant === 'danger' ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest border border-border/50" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest shadow-xl"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal ----
interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4 overflow-y-auto overflow-x-hidden transition-all">
      <div className="fixed inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className={cn('relative bg-card/60 backdrop-blur-3xl border border-white/10 dark:border-white/5 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full my-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500', sizes[size])}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-border/30">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 border border-border/30">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  )
}

// ---- Toast ----
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' }
let toastQueue: Toast[] = []
let listeners: (() => void)[] = []

function notify() { listeners.forEach(l => l()) }

export const toast = {
  success: (message: string) => {
    const id = Date.now().toString()
    toastQueue = [...toastQueue, { id, message, type: 'success' }]
    notify()
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 4000)
  },
  error: (message: string) => {
    const id = Date.now().toString()
    toastQueue = [...toastQueue, { id, message, type: 'error' }]
    notify()
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 5000)
  },
  info: (message: string) => {
    const id = Date.now().toString()
    toastQueue = [...toastQueue, { id, message, type: 'info' }]
    notify()
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 4000)
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const update = () => setToasts([...toastQueue])
    listeners.push(update)
    update() // initial
    return () => { listeners = listeners.filter(l => l !== update) }
  }, [])

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertOctagon className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
  }

  const borderMap = {
    success: 'border-emerald-500/20 shadow-emerald-500/10',
    error: 'border-destructive/20 shadow-destructive/10',
    info: 'border-primary/20 shadow-primary/10',
  }

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none sm:max-w-md w-full">
      {toasts.map((t) => (
        <div key={t.id} className={cn(
          'pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-2xl bg-card/80 animate-in slide-in-from-right-8 fade-in h-auto min-w-[320px] ring-1 ring-white/10 transition-all duration-300',
          borderMap[t.type]
        )}>
          <div className="flex-shrink-0">{iconMap[t.type]}</div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5 font-mono">
              {t.type === 'error' ? 'Security Protocol' : 'Core Response'}
            </div>
            <p className="text-xs font-bold text-foreground leading-tight tracking-tight">{t.message}</p>
          </div>
          <button onClick={() => { toastQueue = toastQueue.filter(x => x.id !== t.id); notify() }} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground/40 hover:text-foreground transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
