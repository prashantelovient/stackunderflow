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
    UserPlus,
    UserCircle,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    User
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { authService } from '@/auth/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import loginBg from '@/assets/login-bg.png'

export default function UnifiedRegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState<'student' | 'instructor'>('student')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError('')

        try {
            const data = await authService.register(name, email, password, role)
            login(data.token, data.user)

            if (data.user.role === 'student') {
                navigate('/student/dashboard')
            } else if (data.user.role === 'instructor') {
                navigate('/instructor/dashboard')
            } else if (data.user.role === 'admin') {
                navigate('/admin/dashboard')
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse overflow-hidden font-sans">
            {/* Left Side: Visual Experience (Reversed for variety) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
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
                    <div className="absolute inset-0 bg-gradient-to-bl from-primary/80 via-primary/40 to-transparent mix-blend-multiply" />
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
                            Start Your Legacy
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter italic">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                                Elite Academy
                            </span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-xl text-white/70 font-medium leading-relaxed max-w-md"
                    >
                        Whether you're here to learn or to share your expertise, VaultLearn provides the tools you need to succeed at the highest level.
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center z-10">
                    <div className="text-xs font-bold text-white/40 tracking-[0.5em] uppercase">
                        Secure Registration
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[450px] space-y-8"
                >
                    {/* Brand Header */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                        <motion.div
                            whileHover={{ rotate: 5 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-2xl shadow-primary/20"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground italic flex items-center gap-2">
                                Create Account
                                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                            </h1>
                            <p className="text-muted-foreground font-medium">Join 10,000+ others on their learning journey.</p>
                        </div>
                    </div>

                    {/* Registration Form Card */}
                    <Card className="border-border bg-card/40 backdrop-blur-2xl shadow-xl overflow-hidden rounded-[2.5rem] p-10">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                        I am joining as a...
                                    </label>
                                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                        <SelectTrigger className="h-14 bg-background/50 border-border rounded-2xl shadow-sm focus:ring-primary/20">
                                            <div className="flex items-center gap-2">
                                                {role === 'student' ? <UserCircle className="w-4 h-4 text-primary" /> : <ShieldCheck className="w-4 h-4 text-secondary" />}
                                                <SelectValue placeholder="Select account type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border rounded-xl shadow-xl">
                                            <SelectItem value="student" className="cursor-pointer focus:bg-primary/10">
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="w-4 h-4 text-primary" />
                                                    <span className="font-semibold text-sm">Student</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="instructor" className="cursor-pointer focus:bg-secondary/10">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-secondary" />
                                                    <span className="font-semibold text-sm">Instructor</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Full Name Field */}
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Wick"
                                            required
                                            className="h-14 pl-12 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm md:text-base text-foreground placeholder:text-muted-foreground/60 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="h-14 pl-12 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm md:text-base text-foreground placeholder:text-muted-foreground/60 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Password Field */}
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm md:text-base text-foreground placeholder:text-muted-foreground/60 transition-all font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                            Confirm
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm md:text-base text-foreground placeholder:text-muted-foreground/60 transition-all font-medium"
                                            />
                                        </div>
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
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" strokeWidth={3} />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all duration-300">
                                            Secure Registration
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                </Button>
                            </motion.div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:underline font-black transition-all decoration-2 underline-offset-4">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </Card>

                    {/* Footer Links */}
                    <div className="pt-8 flex items-center justify-between border-t border-muted/50">
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
