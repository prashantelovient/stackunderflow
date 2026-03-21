import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    GraduationCap,
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { authService } from '@/auth/services/authService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-15%] left-[-5%] w-[600px] h-[600px] bg-secondary/20 blur-[150px] rounded-full animate-float" />
            </div>

            <div className="w-full max-w-[440px] relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Logo Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] shadow-2xl shadow-primary/30 transform hover:rotate-12 transition-all duration-500 group">
                        <GraduationCap className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic">VaultLearn</h1>
                        <p className="text-muted-foreground font-medium">One login for your entire journey.</p>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="border-border bg-card/40 backdrop-blur-2xl shadow-xl overflow-hidden rounded-[2.5rem]">
                    <CardContent className="p-10">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="h-14 pl-12 bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-foreground placeholder:text-muted-foreground/60 shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Password
                                    </label>
                                    <Link to="#" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 mt-4 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" strokeWidth={3} />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Enter Dashboard
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm font-medium text-muted-foreground mt-10">
                            New here?{' '}
                            <Link to="/register" className="text-primary hover:underline font-black transition-colors decoration-2 underline-offset-4">
                                Join the Academy
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Footer Info */}
                <p className="text-center text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/60 px-8 leading-relaxed">
                    VAULTLEARN &copy; {new Date().getFullYear()} SECURE ACCESS
                </p>
            </div>
        </div>
    )
}
