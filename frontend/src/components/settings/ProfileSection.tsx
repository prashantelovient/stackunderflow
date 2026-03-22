import { Camera, Mail, Save, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ProfileSettings } from '@/instructor/services/instructorSettingsService'

type ProfileSectionProps = {
  value: ProfileSettings
  previewUrl: string | null
  onFieldChange: (field: keyof ProfileSettings, value: string) => void
  onAvatarChange: (file: File | null) => void
  onSave: () => void
  saving: boolean
  error?: string | null
}

export function ProfileSection({
  value,
  previewUrl,
  onFieldChange,
  onAvatarChange,
  onSave,
  saving,
  error
}: ProfileSectionProps) {
  const avatarFallback = value.name?.trim()?.[0]?.toUpperCase() || 'I'
  const avatarSrc = previewUrl || value.avatarUrl

  return (
    <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Profile Settings</CardTitle>
            <CardDescription className="text-xs">Update how students see you across VaultLearn.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 rounded-2xl border border-white/10 shadow-lg">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="rounded-2xl bg-primary/20 text-xl font-bold text-primary">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 rounded-xl border border-white/10 bg-background/80 p-2 text-primary shadow-lg">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <div>
              <input
                id="instructor-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="instructor-avatar-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-background/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
              >
                Upload new photo
              </label>
              <p className="mt-2 text-[11px] text-muted-foreground">PNG or JPG up to 2MB.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <Input
              value={value.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="Instructor name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary/80" />
              Email
            </label>
            <Input
              value={value.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="you@vaultlearn.com"
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</label>
          <Textarea
            value={value.bio}
            onChange={(e) => onFieldChange('bio', e.target.value)}
            placeholder="Tell students about your teaching style, experience, and expertise."
            className="min-h-28"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

