import { useState, useCallback } from 'react'
import { X, AlertTriangle } from 'lucide-react'
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
  isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading, onConfirm, onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
          )}>
            <AlertTriangle className={cn('w-5 h-5', variant === 'danger' ? 'text-red-600' : 'text-blue-600')} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
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
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full my-4', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
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
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 3500)
  },
  error: (message: string) => {
    const id = Date.now().toString()
    toastQueue = [...toastQueue, { id, message, type: 'error' }]
    notify()
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 3500)
  },
  info: (message: string) => {
    const id = Date.now().toString()
    toastQueue = [...toastQueue, { id, message, type: 'info' }]
    notify()
    setTimeout(() => { toastQueue = toastQueue.filter(t => t.id !== id); notify() }, 3500)
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useCallback(() => {
    const update = () => setToasts([...toastQueue])
    listeners.push(update)
    return () => { listeners = listeners.filter(l => l !== update) }
  }, [])()

  // Simple re-render trigger
  useCallback(() => {
    const update = () => setToasts([...toastQueue])
    listeners = [update]
  }, [])

  useState(() => {
    const update = () => setToasts([...toastQueue])
    listeners.push(update)
  })

  const typeStyles: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-64 max-w-sm animate-in slide-in-from-bottom-4 duration-300', typeStyles[t.type])}>
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => { toastQueue = toastQueue.filter(x => x.id !== t.id); setToasts([...toastQueue]) }} className="ml-auto hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
