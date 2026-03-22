import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    Lock,
    Mail,
    ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { authService } from '@/auth/services/authService'
import { useThemeStore } from '@/store/themeStore'
import backgroundlogin from '@/assets/backgroundlogin.png'
import backgroundlogin_dark from '@/assets/backgroundlogin_dark.png'
import cardimageleft from '@/assets/cardimageleft.png'
import cardimageleft_dark from '@/assets/cardimageleft_dark.png'

export default function UnifiedLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuthStore()
    const { isDark } = useThemeStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await authService.login(email, password, 'student')
            login(data.token, data.user)

            if (data.user.role === 'student') {
                navigate('/student/dashboard')
            } else if (data.user.role === 'instructor') {
                navigate('/instructor/dashboard')
            } else if (data.user.role === 'admin') {
                navigate('/admin/dashboard')
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen font-body overflow-x-hidden selection:bg-blue-200 dark:selection:bg-purple-900 bg-background text-foreground transition-colors duration-500">
            {/* Background Layer - High Impact */}
            <div
                className="fixed inset-0 z-[-10] bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
                style={{ backgroundImage: `url(${isDark ? backgroundlogin_dark : backgroundlogin})` }}
            />
            {/* Premium Glassy Overlay Layer */}
            <div className="fixed inset-0 z-[-5] bg-white/30 dark:bg-black/40 backdrop-blur-[8px]" />
            <div className="fixed inset-0 z-[-4] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 dark:from-purple-500/20 dark:to-blue-500/20" />

            {/* Top Navigation - Elevated Design */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 w-full flex justify-between items-center px-12 py-6 z-50 bg-white/40 dark:bg-card/40 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-primary dark:to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-primary dark:via-secondary dark:to-primary font-headline italic">
                        VaultLearn
                    </div>
                </div>
                <div className="hidden md:flex gap-8">
                    {['Academy', 'Library', 'Community'].map((item) => (
                        <Link key={item} to="#" className="text-sm font-bold text-slate-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-primary transition-colors tracking-widest uppercase">{item}</Link>
                    ))}
                </div>
            </motion.header>

            <main className="min-h-screen pt-32 pb-16 flex items-center justify-center relative px-4">
                {/* Dynamic Ambient Glows */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-400 dark:bg-primary opacity-40 blur-[160px] z-[-1]"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-purple-400 dark:bg-secondary opacity-40 blur-[160px] z-[-1]"
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-6xl w-full"
                >
                    {/* Unified Auth Card - Premium Glassmorphism */}
                    <div className="relative glass-panel w-full rounded-[3rem] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.15)] overflow-hidden ring-1 ring-white/40 dark:ring-white/10 grid grid-cols-1 lg:grid-cols-2 bg-white/60 dark:bg-card/80 backdrop-blur-3xl">

                        {/* Left: Immersive Visual Section */}
                        <div className="hidden lg:block relative p-16 bg-gradient-to-br from-slate-50/80 to-blue-50/40 dark:from-card/50 dark:to-background/30">
                            <div className="relative h-full flex flex-col justify-center gap-10">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 1 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-8 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 dark:from-primary/20 dark:to-secondary/20 rounded-full blur-[60px] animate-pulse" />
                                    <img
                                        alt="Vault Curated Illustration"
                                        className="relative rounded-[2.5rem] shadow-2xl w-full aspect-square object-cover transform hover:scale-[1.02] transition-transform duration-700 ring-1 ring-white/20"
                                        src={isDark ? cardimageleft_dark : cardimageleft}
                                    />
                                </motion.div>
                                <div className="space-y-6">
                                    <h2 className="font-headline text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-foreground leading-[1.1] italic">
                                        Empower your <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-primary dark:to-secondary">Digital Journey.</span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-muted-foreground text-lg leading-relaxed max-w-md font-medium">
                                        Join a collective of elite curators unlocking high-dimensional knowledge through interactive paths.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Premium Sign In Form */}
                        <div className="p-10 lg:p-20 flex flex-col justify-center bg-white/40 dark:bg-card/60">
                            <div className="max-w-md w-full mx-auto">
                                <section className="mb-12 text-center lg:text-left">
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="font-headline text-5xl font-black mb-3 text-slate-900 dark:text-foreground tracking-tight italic"
                                    >
                                        Initiate Access
                                    </motion.h1>
                                    <p className="font-body text-slate-500 dark:text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] opacity-70">Security protocol required for entry</p>
                                </section>

                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -10 }}
                                            className="mb-8 p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-4 shadow-sm"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-7">
                                    <div className="space-y-3 group">
                                        <label className="font-label text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-muted-foreground ml-1 block">Work Identifier</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-muted-foreground group-focus-within:text-blue-500 dark:group-focus-within:text-primary transition-colors" />
                                            <input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-white/80 dark:bg-input backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-5 text-slate-900 dark:text-foreground placeholder:text-slate-300 dark:placeholder:text-muted-foreground focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-primary/10 focus:border-blue-500 dark:focus:border-primary transition-all font-body font-semibold outline-none shadow-sm"
                                                placeholder="curator@vault.com"
                                                type="email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 group">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="font-label text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-muted-foreground">Cryptic Key</label>
                                            <Link to="#" className="text-[10px] font-black text-blue-600 dark:text-primary hover:opacity-70 transition-opacity uppercase tracking-widest">Recovery?</Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-muted-foreground group-focus-within:text-blue-500 dark:group-focus-within:text-primary transition-colors" />
                                            <input
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full bg-white/80 dark:bg-input backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-14 py-5 text-slate-900 dark:text-foreground placeholder:text-slate-300 dark:placeholder:text-muted-foreground focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-primary/10 focus:border-blue-500 dark:focus:border-primary transition-all font-body font-semibold outline-none shadow-sm"
                                                placeholder="••••••••"
                                                type={showPassword ? "text" : "password"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-primary transition-colors p-2"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            disabled={loading}
                                            className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-primary dark:via-secondary dark:to-primary text-white dark:text-primary-foreground font-headline font-black py-5 rounded-2xl shadow-xl shadow-blue-500/25 dark:shadow-primary/20 hover:shadow-blue-500/40 dark:hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 outline-none uppercase tracking-[0.2em] text-xs"
                                            type="submit"
                                        >
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                <>
                                                    Authorize Access
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                            {/* Shimmer Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </button>
                                    </div>
                                </form>

                                <p className="mt-12 text-center text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                    Unregistered Entity? <Link className="text-blue-600 dark:text-primary hover:underline decoration-2 underline-offset-4" to="/register">Initiate Application</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Premium Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="w-full flex flex-col md:flex-row justify-between items-center px-16 py-10 gap-6 bg-white/40 dark:bg-card/40 backdrop-blur-2xl border-t border-white/20 dark:border-white/5"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-foreground font-headline italic tracking-tighter">VaultLearn</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-primary" />
                </div>
                <div className="flex flex-wrap justify-center gap-10">
                    {['Governance', 'Directives', 'Cookies', 'System'].map((text) => (
                        <Link key={text} className="text-slate-500 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-[0.3em]" to="#">{text}</Link>
                    ))}
                </div>
                <div className="text-slate-300 dark:text-muted-foreground/30 font-bold text-[9px] uppercase tracking-[0.4em]">
                    © 2026 ARCHIVE-OS V4.2 - ALL RIGHTS SECURED
                </div>
            </motion.footer>
        </div>
    )
}
