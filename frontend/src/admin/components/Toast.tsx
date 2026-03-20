import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertOctagon, Info } from 'lucide-react'
import { cn } from '@/utils'

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
