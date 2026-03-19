import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Loader2, ShieldCheck, Lock, Mail, ChevronRight, Zap, Terminal } from 'lucide-react'
import { authService } from '@/admin/services'
import { useAuthStore } from '@/admin/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button, Input, Badge } from '@/admin/components/ui'
import { cn } from '@/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Access Denied: Missing credentials.'); return }
    setError(''); setLoading(true)
    try {
      const { token, admin } = await authService.login(email, password)
      login(token, admin)
      navigate('/admin/dashboard')
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } }; message?: string }
      const message =
        anyErr?.response?.data?.message ||
        anyErr?.message ||
        'Security Alert: Unauthorized credentials detected.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse delay-700" />

      {/* Dark toggle */}
      <button
        onClick={toggle}
        className="fixed top-6 right-6 p-3 rounded-2xl bg-card border border-border shadow-2xl text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all z-50 backdrop-blur-md"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Card */}
        <div className="bg-card/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 p-10 sm:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-primary via-primary/80 to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 transition-transform group-hover:scale-105 duration-500">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">VaultLearn <span className="text-primary italic">Pro</span></h1>
            <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              Administrative Terminal
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-foreground">Secure Authorization</h2>
              <p className="text-xs font-medium text-muted-foreground/80">Authorize your session to access the core.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group/input">
                <Input
                  label="Registry Identifier"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vaultlearn.com"
                  className={cn(
                    "bg-card/50 border-white/10 focus:ring-primary/20 pl-11",
                    isDark ? "placeholder-white/20" : "placeholder-black/20"
                  )}
                />
                <Mail className="absolute left-4 top-[38px] w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
              </div>

              <div className="relative group/input">
                <Input
                  label="Authorization Key"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "bg-card/50 border-white/10 focus:ring-primary/20 pl-11 pr-12",
                    isDark ? "placeholder-white/20" : "placeholder-black/20"
                  )}
                />
                <Lock className="absolute left-4 top-[38px] w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-[38px] text-muted-foreground hover:text-foreground transition-colors outline-none"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive flex-shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-destructive leading-tight">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 mt-2 font-black text-sm uppercase tracking-widest group/btn"
              >
                {loading ? 'Authorizing Access...' : (
                  <span className="flex items-center justify-center">
                    Execute Access
                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-6 mt-6 border-t border-white/5">
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2 text-primary font-black text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Credentials Cache
                </div>
                <div className="space-y-1 font-mono text-[10px] font-bold text-muted-foreground/80 flex flex-col uppercase tracking-tighter">
                  <div className="flex justify-between">
                    <span>IDENTIFIER:</span>
                    <span className="text-primary/70">admin@example.com</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                    <span>ACCESS KEY:</span>
                    <span className="text-primary/70">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

