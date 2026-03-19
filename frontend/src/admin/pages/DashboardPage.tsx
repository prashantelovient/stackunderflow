import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/admin/services'
import { Card, CardContent, CardHeader, PageHeader, Spinner, Badge } from '@/admin/components/ui'
import { Users, Video, ListVideo, BookOpen, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils'

export default function DashboardPage() {
  const { isDark } = useThemeStore()
  const { data, isLoading, isError } = useQuery({ queryKey: ['analytics'], queryFn: analyticsService.get })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Initializing Core Analytics...</p>
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
          <div className="space-y-1">
            <p className="font-bold text-destructive">Analytics Sync Failed</p>
            <p className="text-sm text-muted-foreground font-medium">Unable to connect to the telemetry endpoint. Please verify backend accessibility ({import.meta.env.VITE_API_URL || 'localhost:5000'}).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const stats = [
    { label: 'Total Enrolled Students', value: (data?.totalStudents ?? 0).toLocaleString(), icon: Users, color: 'primary', trend: '+12.5%', desc: 'Active participants' },
    { label: 'Platform Video Archive', value: (data?.totalVideos ?? 0).toLocaleString(), icon: Video, color: 'indigo', trend: '+5.2%', desc: 'HLS Streamable assets' },
    { label: 'Active Curriculums', value: (data?.totalCourses ?? 0).toLocaleString(), icon: ListVideo, color: 'violet', trend: '+2.1%', desc: 'Published courses' },
    { label: 'Knowledge Base Articles', value: (data?.totalBlogs ?? 0).toLocaleString(), icon: BookOpen, color: 'pink', trend: '+8.4%', desc: 'Editorial content' },
  ]

  const chartTheme = {
    textColor: isDark ? 'hsl(var(--muted-foreground))' : '#64748b',
    gridColor: isDark ? 'hsla(var(--border), 0.3)' : '#f1f5f9',
    accent: 'hsl(var(--primary))'
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Administrative Terminal"
        subtitle="Real-time strategic overview of your educational ecosystem."
        action={
          <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary bg-primary/5 font-bold tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            LIVE TELEMETRY
          </Badge>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, trend, desc }) => (
          <Card key={label} className="group hover:border-primary/30 hover:shadow-2xl transition-all duration-500 overflow-visible relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500",
                  "bg-muted/50 text-foreground group-hover:bg-primary group-hover:text-white"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    {trend}
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{label}</h3>
                <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em] pt-1">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="p-2">
          <CardHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Enrollment Velocity</h2>
                <p className="text-xs font-medium text-muted-foreground">Student acquisition rates monthly</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data?.studentsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.gridColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: chartTheme.textColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: chartTheme.textColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid hsla(var(--border), 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: chartTheme.accent, fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="New Students" stroke={chartTheme.accent} strokeWidth={4} fill="url(#colorStudents)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-2">
          <CardHeader className="px-6 pt-6 pb-2">
            <div>
              <h2 className="text-lg font-bold">Content Distribution</h2>
              <p className="text-xs font-medium text-muted-foreground">Video uploads and asset growth</p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data?.videosByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.gridColor} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: chartTheme.textColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: chartTheme.textColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsla(var(--muted), 0.3)' }}
                  contentStyle={{
                    background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid hsla(var(--border), 0.2)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="count" name="Videos Uploaded" fill={chartTheme.accent} radius={[6, 6, 0, 0]} barSize={30} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

