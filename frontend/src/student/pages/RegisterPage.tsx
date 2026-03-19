import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, User, ChevronRight } from 'lucide-react'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'
import { studentAuth } from '@/student/services/studentService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/utils'

export default function StudentRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useStudentAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const data = await studentAuth.register(name, email, password)
      login(data.token, data.student)
      navigate('/student/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Logo & Welcome */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-indigo-700 rounded-3xl shadow-2xl shadow-primary/30 transform hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Join the Academy</h1>
            <p className="text-muted-foreground font-medium">Create your account and start mastering new skills</p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 text-center border-b border-border/50 mx-6 mb-6 px-0">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>Enter your details below to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                <div className="w-1 h-4 bg-destructive rounded-full" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="h-12 pl-10 bg-muted/30 border-border focus:ring-primary/20 transition-all rounded-xl shadow-inner-sm"
                  />
                </div>
              </div>

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

              {/* Password Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-12 pl-10 pr-10 bg-muted/30 border-border focus:ring-primary/20 transition-all rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Confirm
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-12 pl-10 bg-muted/30 border-border focus:ring-primary/20 transition-all rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    GET STARTED <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative text-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <span className="relative bg-card px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AGREE TO TERMS</span>
            </div>

            <p className="text-center text-sm font-medium text-muted-foreground">
              Already a member?{' '}
              <Link to="/login" className="text-primary hover:underline font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Legal links */}
        <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40 px-8">
          By creating an account, you agree to our <Link to="#" className="underline">Terms of Service</Link> and <Link to="#" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

