import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GraduationCap,
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    ChevronRight,
    ArrowRight,
    Sparkles
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { authService } from '@/auth/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import loginBg from '@/assets/login-bg.png'

export default function UnifiedLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Backend now detects role automatically from the email/collection
            const data = await authService.login(email, password, 'student') // Role ignored by latest backend
            login(data.token, data.user)

            // Redirect based on role returned from backend
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
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Side: Visual Experience */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-12"
            >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginBg}
                        alt="Vault Learn Background"
                        className="w-full h-full object-cover scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-transparent mix-blend-multiply" />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full max-w-lg space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold tracking-widest uppercase mb-6">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            Elevate Your Learning
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter italic">
                            The Vault <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                                Of Knowledge
                            </span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-xl text-white/70 font-medium leading-relaxed max-w-md"
                    >
                        Access your personalized academy, track your progress, and master new skills in a premium environment designed for excellence.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="pt-12 flex gap-8 items-center"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200" />
                            ))}
                        </div>
                        <p className="text-sm font-bold text-white tracking-wide">JOIN 10K+ LEARNERS</p>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center z-10">
                    <div className="text-xs font-bold text-white/40 tracking-[0.5em] uppercase">
                        Experience Premium
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[400px] space-y-10"
                >
                    {/* Brand Header */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                        <motion.div
                            whileHover={{ rotate: 5 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-2xl shadow-primary/20"
                        >
                            <GraduationCap className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground italic flex items-center gap-2">
                                VaultLearn
                                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                            </h1>
                            <p className="text-muted-foreground font-medium">Please enter your details to sign in.</p>
                        </div>
                    </div>

                    {/* Login Form Card */}
                    <Card className="border-border bg-card/40 backdrop-blur-2xl shadow-xl overflow-hidden rounded-[2.5rem] p-10">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                {/* Email Field */}
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                        Work Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="h-14 pl-12 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-foreground placeholder:text-muted-foreground/60 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="group space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                                            Secret Password
                                        </label>
                                        <Link to="#" className="text-[10px] font-bold text-primary hover:opacity-70 uppercase tracking-widest transition-opacity">
                                            Forgot Key?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="h-14 pl-12 pr-12 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-foreground placeholder:text-muted-foreground/60 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-15 rounded-2xl bg-primary text-primary-foreground font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-primary/20 transition-all disabled:opacity-70 group overflow-hidden relative"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
                                            Sign In to Vault
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                    {/* Shining effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                </Button>
                            </motion.div>
                        </form>

                        <div className="mt-10 text-center space-y-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Don&apos;t have an account?{' '}
                                <Link to="/register" className="text-primary hover:underline font-black transition-all decoration-2 underline-offset-4">
                                    Apply Now
                                </Link>
                            </p>
                        </div>
                    </Card>

                    {/* Footer Links */}
                    <div className="pt-10 flex items-center justify-between border-t border-muted/50">
                        <span className="text-[10px] font-bold text-muted-foreground/40 tracking-[0.2em] uppercase">
                            VaultLearn OS v2.0
                        </span>
                        <div className="flex gap-4">
                            <Link to="#" className="text-[10px] font-bold text-muted-foreground/40 hover:text-primary uppercase tracking-widest transition-colors">Privacy</Link>
                            <Link to="#" className="text-[10px] font-bold text-muted-foreground/40 hover:text-primary uppercase tracking-widest transition-colors">Terms</Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s infinite alternate linear;
                }
            `}</style>
        </div>
    )
}
