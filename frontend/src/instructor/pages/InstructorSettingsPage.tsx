import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  LogOut,
  Settings2,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ToastContainer, toast } from '@/admin/components/Toast'
import { useAuthStore } from '@/auth/store/authStore'
import {
  instructorSettingsService,
  type InstructorSettings,
  type NotificationSettings,
  type PreferenceSettings,
  type ProfileSettings
} from '@/instructor/services/instructorSettingsService'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { PreferencesSection } from '@/components/settings/PreferencesSection'
import { SecuritySection, type SecurityForm } from '@/components/settings/SecuritySection'

const sectionMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' }
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid gap-6">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default function InstructorSettingsPage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()

  const [profile, setProfile] = useState<ProfileSettings>({
    name: '',
    email: '',
    bio: '',
    avatarUrl: ''
  })
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    courseUpdates: true,
    studentMessages: true
  })
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    language: 'English',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    defaultView: 'grid'
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [securityError, setSecurityError] = useState<string | null>(null)

  const [deleteText, setDeleteText] = useState('')

  const currentSettings: InstructorSettings = useMemo(() => ({
    profile,
    notifications,
    preferences
  }), [profile, notifications, preferences])

  const { isLoading } = useQuery({
    queryKey: ['instructor-settings', user?.id],
    queryFn: () => instructorSettingsService.get(user ?? undefined),
    enabled: !!user,
    onSuccess: (data) => {
      setProfile(data.profile)
      setNotifications(data.notifications)
      setPreferences(data.preferences)
    }
  })

  useEffect(() => {
    if (!avatarPreview) return
    return () => URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  const profileMutation = useMutation({
    mutationFn: async () => {
      const avatarUrl = avatarFile ? await fileToDataUrl(avatarFile) : profile.avatarUrl
      const payload: ProfileSettings = { ...profile, avatarUrl }
      return instructorSettingsService.updateProfile(user?.id, payload, { ...currentSettings, profile: payload })
    },
    onSuccess: (result) => {
      setProfile(result.data.profile)
      setNotifications(result.data.notifications)
      setPreferences(result.data.preferences)
      setAvatarFile(null)
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(null)
      }
      updateUser({
        name: result.data.profile.name,
        email: result.data.profile.email,
        avatar: result.data.profile.avatarUrl
      })
      toast.success('Profile updated successfully.')
      if (!result.synced) {
        toast.info('Saved locally. Sync will resume when online.')
      }
    },
    onError: () => toast.error('Unable to update profile. Please try again.')
  })

  const notificationMutation = useMutation({
    mutationFn: () => instructorSettingsService.updateNotifications(user?.id, notifications, currentSettings),
    onSuccess: (result) => {
      setNotifications(result.data.notifications)
      toast.success('Notification preferences saved.')
      if (!result.synced) toast.info('Saved locally. Sync will resume when online.')
    },
    onError: () => toast.error('Unable to save notification preferences.')
  })

  const preferencesMutation = useMutation({
    mutationFn: () => instructorSettingsService.updatePreferences(user?.id, preferences, currentSettings),
    onSuccess: (result) => {
      setPreferences(result.data.preferences)
      toast.success('Instructor preferences updated.')
      if (!result.synced) toast.info('Saved locally. Sync will resume when online.')
    },
    onError: () => toast.error('Unable to save preferences.')
  })

  const securityMutation = useMutation({
    mutationFn: () => instructorSettingsService.changePassword({
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword
    }),
    onSuccess: (result) => {
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully.')
      if (!result.synced) toast.info('Password update queued for sync.')
    },
    onError: () => toast.error('Unable to update password.')
  })

  const deleteMutation = useMutation({
    mutationFn: () => instructorSettingsService.deleteAccount(user?.id),
    onSuccess: (result) => {
      toast.success('Account deletion requested.')
      if (!result.synced) toast.info('Deletion queued for sync.')
      logout()
      navigate('/login')
    },
    onError: () => toast.error('Unable to delete account.')
  })

  const handleAvatarChange = (file: File | null) => {
    setProfileError(null)
    if (!file) {
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be smaller than 2MB.')
      return
    }
    const url = URL.createObjectURL(file)
    setAvatarFile(file)
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }

  const handleProfileSave = () => {
    setProfileError(null)
    if (!profile.name.trim()) {
      setProfileError('Name is required.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setProfileError('Please enter a valid email address.')
      return
    }
    profileMutation.mutate()
  }

  const handlePasswordSave = () => {
    setSecurityError(null)
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setSecurityError('Please fill in all password fields.')
      return
    }
    if (securityForm.newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.')
      return
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError('New passwords do not match.')
      return
    }
    securityMutation.mutate()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="space-y-8 pb-12">
      <ToastContainer />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Instructor Settings</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile, security, and workspace defaults in one place.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Secure Workspace
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList variant="line" className="w-full flex-wrap justify-start gap-2 border-b border-white/10 bg-transparent px-0">
          {[
            { value: 'profile', label: 'Profile' },
            { value: 'security', label: 'Security' },
            { value: 'preferences', label: 'Preferences' },
            { value: 'danger', label: 'Danger Zone' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground data-active:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <motion.div {...sectionMotion}>
            <ProfileSection
              value={profile}
              previewUrl={avatarPreview}
              onFieldChange={(field, value) => setProfile((prev) => ({ ...prev, [field]: value }))}
              onAvatarChange={handleAvatarChange}
              onSave={handleProfileSave}
              saving={profileMutation.isPending}
              error={profileError}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div {...sectionMotion}>
            <SecuritySection
              value={securityForm}
              showPasswords={showPasswords}
              onToggleVisibility={() => setShowPasswords((prev) => !prev)}
              onFieldChange={(field, value) => setSecurityForm((prev) => ({ ...prev, [field]: value }))}
              onSave={handlePasswordSave}
              saving={securityMutation.isPending}
              error={securityError}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="preferences">
          <motion.div {...sectionMotion}>
            <PreferencesSection
              notifications={notifications}
              preferences={preferences}
              onToggleNotification={(key, value) => setNotifications((prev) => ({ ...prev, [key]: value }))}
              onPreferenceChange={(key, value) => setPreferences((prev) => ({ ...prev, [key]: value as PreferenceSettings[keyof PreferenceSettings] }))}
              onSaveNotifications={() => notificationMutation.mutate()}
              onSavePreferences={() => preferencesMutation.mutate()}
              savingNotifications={notificationMutation.isPending}
              savingPreferences={preferencesMutation.isPending}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="danger">
          <motion.div {...sectionMotion}>
            <Card className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-xl shadow-2xl shadow-black/20">
              <CardHeader className="border-b border-red-500/20 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-red-100">Danger Zone</CardTitle>
                    <CardDescription className="text-xs text-red-200/70">
                      These actions are irreversible. Proceed with caution.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Log out of instructor account</p>
                    <p className="text-xs text-muted-foreground">Sign out of the dashboard on this device.</p>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-100">Delete instructor account</p>
                    <p className="text-xs text-red-200/70">
                      This will permanently remove your instructor profile and course data.
                    </p>
                  </div>
                  <Dialog onOpenChange={(open) => { if (!open) setDeleteText('') }}>
                    <DialogTrigger>
                      <Button variant="destructive" className="rounded-xl">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-white/10 bg-black/70 backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle>Delete your account?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. Type DELETE to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Input
                          value={deleteText}
                          onChange={(e) => setDeleteText(e.target.value)}
                          placeholder="Type DELETE"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          disabled={deleteText !== 'DELETE' || deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate()}
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
