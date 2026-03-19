import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/admin/services'
import { Card, CardContent, CardHeader, PageHeader, Spinner } from '@/admin/components/ui'
import { Users, Video, ListVideo, BookOpen, TrendingUp, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { useThemeStore } from '@/store/themeStore'

export default function DashboardPage() {
  const { isDark } = useThemeStore()
  const { data, isLoading, isError } = useQuery({ queryKey: ['analytics'], queryFn: analyticsService.get })

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  if (isError) return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening on your platform." />
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">Could not load analytics. Make sure the backend server is running on <code>http://localhost:5000</code>.</p>
      </div>
    </div>
  )

  const stats = [
    { label: 'Total Students', value: (data?.totalStudents ?? 0).toLocaleString(), icon: Users, color: 'amber', change: '+12%' },
    { label: 'Total Videos', value: (data?.totalVideos ?? 0).toLocaleString(), icon: Video, color: 'amber', change: '+5%' },
    { label: 'Total Playlists', value: (data?.totalPlaylists ?? 0).toLocaleString(), icon: ListVideo, color: 'amber', change: '+2%' },
    { label: 'Total Blogs', value: (data?.totalBlogs ?? 0).toLocaleString(), icon: BookOpen, color: 'amber', change: '+8%' },
  ]

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  }

  const chartTheme = { textColor: isDark ? '#9ca3af' : '#6b7280', gridColor: isDark ? '#1f2937' : '#f3f4f6' }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening on your platform." />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-start justify-between pt-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">{change} this month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Student Registrations</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly new student sign-ups</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.studentsByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }} labelStyle={{ color: isDark ? '#f9fafb' : '#111' }} />
                <Area type="monotone" dataKey="count" name="Students" stroke="#f59e0b" strokeWidth={2} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Video Uploads</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly video content added</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.videosByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }} labelStyle={{ color: isDark ? '#f9fafb' : '#111' }} />
                <Legend />
                <Bar dataKey="count" name="Videos" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

