import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { settingsService } from '@/admin/services'
import { PageHeader, Spinner, Card, CardHeader, CardContent, Button, Input, Badge } from '@/admin/components/ui'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { Globe, Mail, Cloud, Shield, Settings2, Cpu, Database, Lock, Save, Camera, Terminal, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils'

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
    onSuccess: () => toast.success('Core parameters synchronized.'),
    onError: () => toast.error('Security Protocol: Synchronization failure.'),
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Accessing Core Parameters...</p>
    </div>
  )

  const sections = [
    {
      key: 'platform', icon: Globe, title: 'Platform Identity', description: 'Public-facing registry and visual identifier.',
      content: (
        <div className="space-y-6">
          <Input label="Registry Name" value={form.platformName} onChange={(e) => setForm((f: any) => ({ ...f, platformName: e.target.value }))} placeholder="VaultLearn Operational" />
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Identifier (Logo)</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[1.5rem] border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden bg-muted/20 group hover:border-primary/50 transition-all shadow-inner relative">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <Globe className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <input type="file" accept="image/*" id="logo-upload" className="hidden" onChange={handleLogoChange} />
                <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-foreground text-background rounded-xl hover:opacity-80 transition-all shadow-lg active:scale-95">
                  Link Graphic
                </label>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">System formats: PNG, JPG (MAX 2MB)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email', icon: Mail, title: 'Signal Relay (SMTP)', description: 'Configure outbound communication protocols.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input label="Relay Host" value={form.emailHost} onChange={(e) => setForm((f: any) => ({ ...f, emailHost: e.target.value }))} placeholder="relay.example.com" />
          <Input label="Access Port" type="number" defaultValue="587" placeholder="587" />
          <Input label="Auth Username" placeholder="system@example.com" />
          <Input label="Auth Secret" type="password" placeholder="••••••••" />
          <Input label="Display Identity" placeholder="VaultLearn Systems" />
          <Input label="Return Signal (Email)" placeholder="noreply@vaultlearn.com" />
        </div>
      )
    },
    {
      key: 's3', icon: Cloud, title: 'Asset Storage (S3)', description: 'Cloud registry for digital educational assets.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input label="Bucket Identifier" value={form.s3Bucket} onChange={(e) => setForm((f: any) => ({ ...f, s3Bucket: e.target.value }))} placeholder="core-asset-archive" />
          <Input label="Strategic Region" value={form.s3Region} onChange={(e) => setForm((f: any) => ({ ...f, s3Region: e.target.value }))} placeholder="us-east-1" />
          <Input label="Access Key ID" placeholder="AKIA..." />
          <Input label="Private Secret" type="password" placeholder="••••••••" />
          <Input label="Edge Distribution (CDN)" placeholder="https://cdn.vaultlearn.net" className="sm:col-span-2" />
        </div>
      )
    },
    {
      key: 'security', icon: Shield, title: 'Security Protocol', description: 'Internal access control and encryption parameters.',
      content: (
        <div className="space-y-6 max-w-md">
          <Input label="Current Auth Key" type="password" placeholder="••••••••" />
          <Input label="New Auth Key" type="password" placeholder="••••••••" />
          <Input label="Confirm Registry Key" type="password" placeholder="••••••••" />
        </div>
      )
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <ToastContainer />
      <PageHeader
        title="Core Parameters"
        subtitle="Manage secure system integrations and operational dependencies."
        action={
          <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 font-black tracking-widest flex gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            ENCRYPTED TRANSIT
          </Badge>
        }
      />

      <div className="space-y-8 max-w-5xl">
        <div className="grid gap-8">
          {sections.map(({ key, icon: Icon, title, description, content }) => (
            <Card key={key} className="rounded-[2.5rem] border-border/40 shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden hover:bg-card hover:border-primary/20 transition-all duration-500">
              <CardHeader className="p-8 pb-4 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground tracking-tight">{title}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">{content}</CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button size="lg" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="rounded-2xl px-12 py-8 shadow-2xl shadow-primary/30 font-black text-sm uppercase tracking-[0.2em] bg-primary hover:scale-[1.02] active:scale-95 transition-all">
            <Save className="w-5 h-5 mr-3" />
            Synchronize Core
          </Button>
        </div>
      </div>
    </div>
  )
}

