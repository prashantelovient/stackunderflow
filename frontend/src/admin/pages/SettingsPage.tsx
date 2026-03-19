import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { settingsService } from '@/admin/services'
import { PageHeader, Spinner, Card, CardHeader, CardContent, Button, Input } from '@/admin/components/ui'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { Globe, Mail, Cloud, Shield } from 'lucide-react'

interface SettingsForm { platformName: string; emailHost: string; s3Bucket: string; s3Region: string }

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({ platformName: '', emailHost: '', s3Bucket: '', s3Region: '' })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
    onSuccess: (data: SettingsForm) => setForm(data),
  } as Parameters<typeof useQuery>[0])

  const saveMutation = useMutation({
    mutationFn: () => settingsService.update(form),
    onSuccess: () => toast.success('Settings saved successfully!'),
    onError: () => toast.error('Failed to save settings.'),
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const sections = [
    {
      key: 'platform', icon: Globe, title: 'Platform Settings', description: 'General configuration for your platform.',
      content: (
        <div className="space-y-4">
          <Input label="Platform Name" value={form.platformName} onChange={(e) => setForm(f => ({ ...f, platformName: e.target.value }))} placeholder="VideoLearn Pro" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Globe className="w-6 h-6 text-gray-400" />}
              </div>
              <div>
                <input type="file" accept="image/*" id="logo-upload" className="hidden" onChange={handleLogoChange} />
                <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                  Upload Logo
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email', icon: Mail, title: 'Email Settings', description: 'Configure SMTP for transactional emails.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="SMTP Host" value={form.emailHost} onChange={(e) => setForm(f => ({ ...f, emailHost: e.target.value }))} placeholder="smtp.example.com" />
          <Input label="SMTP Port" type="number" defaultValue="587" placeholder="587" />
          <Input label="SMTP Username" placeholder="noreply@example.com" />
          <Input label="SMTP Password" type="password" placeholder="••••••••" />
          <Input label="From Name" placeholder="VideoLearn Pro" />
          <Input label="From Email" placeholder="noreply@example.com" />
        </div>
      )
    },
    {
      key: 's3', icon: Cloud, title: 'S3 / Storage Configuration', description: 'Configure cloud storage for videos and assets.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="S3 Bucket Name" value={form.s3Bucket} onChange={(e) => setForm(f => ({ ...f, s3Bucket: e.target.value }))} placeholder="my-video-bucket" />
          <Input label="AWS Region" value={form.s3Region} onChange={(e) => setForm(f => ({ ...f, s3Region: e.target.value }))} placeholder="us-east-1" />
          <Input label="AWS Access Key ID" placeholder="AKIA..." />
          <Input label="AWS Secret Access Key" type="password" placeholder="••••••••" />
          <Input label="CDN URL (optional)" placeholder="https://cdn.example.com" className="sm:col-span-2" />
        </div>
      )
    },
    {
      key: 'security', icon: Shield, title: 'Security', description: 'Manage admin authentication and access.',
      content: (
        <div className="space-y-4 max-w-md">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
        </div>
      )
    },
  ]

  return (
    <div>
      <ToastContainer />
      <PageHeader title="Settings" subtitle="Configure your platform settings and integrations." />

      <div className="space-y-6 max-w-4xl">
        {sections.map(({ key, icon: Icon, title, description, content }) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">{content}</CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button size="lg" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

