import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, ChevronRight } from 'lucide-react'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'
import { studentAuth } from '@/student/services/studentService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/utils'

export default function StudentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useStudentAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await studentAuth.login(email, password)
      login(data.token, data.student)
      navigate('/student/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Logo & Welcome */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-indigo-700 rounded-3xl shadow-2xl shadow-primary/30 transform hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground font-medium">Continue your learning journey today</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 text-center border-b border-border/50 mx-6 mb-6 px-0">
            <CardTitle className="text-xl font-bold">Student Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                <div className="w-1 h-4 bg-destructive rounded-full" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="h-12 pl-10 bg-muted/30 border-border focus:ring-primary/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <Link to="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 pl-10 pr-12 bg-muted/30 border-border focus:ring-primary/20 transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    SIGN IN <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative text-center py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <span className="relative bg-card px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">OR</span>
            </div>

            <p className="text-center text-sm font-medium text-muted-foreground">
              New to VaultLearn?{' '}
              <Link to="/register" className="text-primary hover:underline font-bold transition-colors">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Admin Link */}
        <div className="text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Are you an educator?{' '}
            <Link to="/admin/login" className="text-muted-foreground hover:text-primary transition-colors">
              Access Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

