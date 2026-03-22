import { Bell, Clock, Globe, LayoutGrid, List, MessageSquare, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { NotificationSettings, PreferenceSettings } from '@/instructor/services/instructorSettingsService'

type PreferencesSectionProps = {
  notifications: NotificationSettings
  preferences: PreferenceSettings
  onToggleNotification: (key: keyof NotificationSettings, value: boolean) => void
  onPreferenceChange: (key: keyof PreferenceSettings, value: string) => void
  onSaveNotifications: () => void
  onSavePreferences: () => void
  savingNotifications: boolean
  savingPreferences: boolean
}

const languages = ['English', 'Hindi', 'Spanish', 'German', 'French']
const timezones = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London',
  'Asia/Singapore',
  'Australia/Sydney',
]

export function PreferencesSection({
  notifications,
  preferences,
  onToggleNotification,
  onPreferenceChange,
  onSaveNotifications,
  onSavePreferences,
  savingNotifications,
  savingPreferences
}: PreferencesSectionProps) {
  const timezoneOptions = timezones.includes(preferences.timezone)
    ? timezones
    : [preferences.timezone, ...timezones]

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
        <CardHeader className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">Choose how you want to stay updated.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {[
            {
              key: 'emailNotifications',
              title: 'Email notifications',
              description: 'Weekly progress and revenue summaries.',
              icon: Bell,
            },
            {
              key: 'courseUpdates',
              title: 'Course updates',
              description: 'Alerts when students enroll or leave reviews.',
              icon: Sparkles,
            },
            {
              key: 'studentMessages',
              title: 'Student messages',
              description: 'Get notified when students send you questions.',
              icon: MessageSquare,
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <item.icon className="h-4 w-4 text-primary/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={notifications[item.key as keyof NotificationSettings]}
                onCheckedChange={(val) => onToggleNotification(item.key as keyof NotificationSettings, val)}
              />
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={onSaveNotifications}
              disabled={savingNotifications}
              className="rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400"
            >
              {savingNotifications ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
        <CardHeader className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Instructor Preferences</CardTitle>
              <CardDescription className="text-xs">Customize your workspace defaults.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                Language
              </Label>
              <Select value={preferences.language} onValueChange={(val) => onPreferenceChange('language', val)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Timezone
              </Label>
              <Select value={preferences.timezone} onValueChange={(val) => onPreferenceChange('timezone', val)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dashboard default view</Label>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={preferences.defaultView === 'grid' ? 'default' : 'outline'}
                className="rounded-xl px-4"
                onClick={() => onPreferenceChange('defaultView', 'grid')}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={preferences.defaultView === 'list' ? 'default' : 'outline'}
                className="rounded-xl px-4"
                onClick={() => onPreferenceChange('defaultView', 'list')}
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSavePreferences}
              disabled={savingPreferences}
              className="rounded-xl bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-400"
            >
              {savingPreferences ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Defaults
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
