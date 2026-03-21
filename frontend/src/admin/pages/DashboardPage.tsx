import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/admin/services'
import { Card, CardContent, CardHeader, PageHeader, Spinner, Badge } from '@/admin/components/ui'
import { Users, Video, ListVideo, BookOpen, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useThemeStore } from '@/store/themeStore'
import { BentoStyles, GlobalSpotlight, ParticleCard } from '@/components/ui/magic-bento'
import { useRef } from 'react'

export default function DashboardPage() {
  const { isDark } = useThemeStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.get
  })

  // ✅ THEME
  const chartTheme = {
    textColor: isDark ? '#CBD5F5' : '#475569',
    gridColor: isDark ? '#334155' : '#E2E8F0',
    accent: isDark ? '#6366F1' : '#4F46E5'
  }

  const statsRef = useRef<HTMLDivElement>(null)

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
        Initializing Core Analytics...
      </p>
    </div>
  )

  if (isError) return (
    <div className="space-y-6">
      <PageHeader title="Command Dashboard" subtitle="Overview of platform performance and growth metrics." />
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-bold text-destructive">Analytics Sync Failed</p>
            <p className="text-sm text-muted-foreground">
              Unable to connect backend ({import.meta.env.VITE_API_URL || 'localhost:5000'})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ✅ FILTER ONLY LAST 6 MONTHS
  const studentsData = [...(data?.studentsByMonth || [])]
    .slice(-6)

  const videosData = [...(data?.videosByMonth || [])]
    .slice(-6)

  const stats = [
    { label: 'Total Enrolled Students', value: (data?.totalStudents ?? 0).toLocaleString(), icon: Users, trend: '+12.5%' },
    { label: 'Platform Video Archive', value: (data?.totalVideos ?? 0).toLocaleString(), icon: Video, trend: '+5.2%' },
    { label: 'Active Curriculums', value: (data?.totalCourses ?? 0).toLocaleString(), icon: ListVideo, trend: '+2.1%' },
    { label: 'Knowledge Base Articles', value: (data?.totalBlogs ?? 0).toLocaleString(), icon: BookOpen, trend: '+8.4%' },
  ]


  return (
    <div className="space-y-10 bento-section">
      <BentoStyles glowColor="132, 0, 255" />
      <PageHeader
        title="Administrative Terminal"
        subtitle="Real-time overview of your platform."
        action={
          <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 font-bold">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            LIVE
          </Badge>
        }
      />

      <GlobalSpotlight gridRef={statsRef} spotlightRadius={400} glowColor="132, 0, 255" />
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <ParticleCard
            key={label}
            className="group hover:shadow-xl transition rounded-2xl overflow-hidden card--border-glow"
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            particleCount={8}
          >
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {trend}
                </span>
              </div>
              <h3 className="text-xs text-muted-foreground uppercase">{label}</h3>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </ParticleCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Area Chart */}
        <Card className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800">
          <CardHeader className="px-6 pt-6 pb-2">
            <h2 className="font-bold">Enrollment Velocity</h2>
          </CardHeader>

          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={studentsData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke={chartTheme.gridColor} strokeDasharray="4 4" vertical={false} />

                <XAxis dataKey="month" stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                <YAxis stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />

                <Tooltip
                  contentStyle={{
                    background: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: 10
                  }}
                  labelStyle={{ color: chartTheme.textColor }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={chartTheme.accent}
                  strokeWidth={3}
                  fill="url(#colorStudents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="p-2 bg-white dark:bg-slate-900 border dark:border-slate-800">
          <CardHeader className="px-6 pt-6 pb-2">
            <h2 className="font-bold">Content Distribution</h2>
          </CardHeader>

          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={videosData}>
                <CartesianGrid stroke={chartTheme.gridColor} strokeDasharray="4 4" vertical={false} />

                <XAxis dataKey="month" stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />
                <YAxis stroke={chartTheme.textColor} tick={{ fill: chartTheme.textColor }} />

                <Tooltip
                  contentStyle={{
                    background: isDark ? '#0F172A' : '#FFFFFF',
                    borderRadius: 10
                  }}
                  labelStyle={{ color: chartTheme.textColor }}
                />

                <Bar dataKey="count" fill={chartTheme.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}