import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    GraduationCap,
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    ChevronRight,
    UserPlus,
    UserCircle,
    ShieldCheck
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { authService } from '@/auth/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none opacity-50">
                <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-float delay-1" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/15 blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="w-full max-w-[520px] relative z-10 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                {/* Logo & Intro */}
                <div className="text-center space-y-4">
                    <Link to="/" className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl shadow-2xl shadow-primary/30 group">
                        <UserPlus className="w-10 h-10 text-white group-hover:rotate-12 transition-transform" />
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Access Vault</h1>
                        <p className="text-muted-foreground font-medium">Join our academy today.</p>
                    </div>
                </div>

                {/* Unified Card */}
                <Card className="border-border bg-card/40 backdrop-blur-2xl shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 pb-12">
                        {error && (
                            <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role Selection Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
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

                            {/* Name & Email Field */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Wick"
                                        required
                                        className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm text-foreground placeholder:text-muted-foreground/60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@wick.com"
                                        required
                                        className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm text-foreground placeholder:text-muted-foreground/60"
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
                                    <div className="relative group">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm text-foreground placeholder:text-muted-foreground/60"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm</label>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-14 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-2xl shadow-sm text-foreground placeholder:text-muted-foreground/60"
                                    />
                                </div>
                            </div>

                            {/* Submit Action */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 mt-4 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" strokeWidth={3} />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Create Credentials
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm font-medium text-muted-foreground mt-10">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline font-black transition-colors decoration-2 underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Footer text */}
                <p className="text-center text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/60 px-8">
                    VAULTLEARN &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
                </p>
            </div>
        </div>
    )
}
