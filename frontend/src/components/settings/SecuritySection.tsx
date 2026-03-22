import { Eye, EyeOff, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export type SecurityForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type SecuritySectionProps = {
  value: SecurityForm
  showPasswords: boolean
  onToggleVisibility: () => void
  onFieldChange: (field: keyof SecurityForm, value: string) => void
  onSave: () => void
  saving: boolean
  error?: string | null
}

export function SecuritySection({
  value,
  showPasswords,
  onToggleVisibility,
  onFieldChange,
  onSave,
  saving,
  error
}: SecuritySectionProps) {
  const inputType = showPasswords ? 'text' : 'password'

  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Account Security</CardTitle>
            <CardDescription className="text-xs">Update your password and secure your instructor account.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {[
          { id: 'currentPassword', label: 'Current password', value: value.currentPassword },
          { id: 'newPassword', label: 'New password', value: value.newPassword },
          { id: 'confirmPassword', label: 'Confirm new password', value: value.confirmPassword },
        ].map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {field.label}
            </label>
            <div className="relative">
              <Input
                type={inputType}
                value={field.value}
                onChange={(e) => onFieldChange(field.id as keyof SecurityForm, e.target.value)}
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}

        <p className="text-[11px] text-muted-foreground">
          Password must be at least 8 characters and include a mix of letters and numbers.
        </p>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Updating
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Update Password
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

