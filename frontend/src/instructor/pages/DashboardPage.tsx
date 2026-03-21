import {
    TrendingUp,
    Users,
    DollarSign,
    Timer,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Play,
    CheckCircle2,
    Package,
    Clock,
    ExternalLink,
    Plus,
    BookOpen
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const revenueData = [
    { name: 'Jan', revenue: 2400 },
    { name: 'Feb', revenue: 1398 },
    { name: 'Mar', revenue: 9800 },
    { name: 'Apr', revenue: 3908 },
    { name: 'May', revenue: 4800 },
    { name: 'Jun', revenue: 3800 },
]

const recentStudents = [
    { id: 1, name: 'Alex Rivera', course: 'Next.js 14 For Beginners', date: '2 mins ago', amount: '$49.00', status: 'completed' },
    { id: 2, name: 'Sarah Chen', course: 'Advanced UI Design Patterns', date: '15 mins ago', amount: '$79.00', status: 'completed' },
    { id: 3, name: 'Michael Smith', course: 'React Meta-Frameworks', date: '1 hour ago', amount: '$59.00', status: 'pending' },
    { id: 4, name: 'Elena Gilbert', course: 'Framer Motion Masterclass', date: '2 hours ago', amount: '$99.00', status: 'completed' },
]

const topCourses = [
    { id: 1, name: 'Next.js 14 For Beginners', sales: 124, revenue: '$6,076', rating: 4.8, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop' },
    { id: 2, name: 'Advanced UI Design Patterns', sales: 89, revenue: '$7,031', rating: 4.9, thumbnail: 'https://images.unsplash.com/photo-1541462608141-ad4d14b0b14c?w=400&h=250&fit=crop' },
    { id: 3, name: 'Framer Motion Masterclass', sales: 56, revenue: '$5,544', rating: 5.0, thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=250&fit=crop' },
]

export default function InstructorDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Welcome back, John! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <Avatar key={i} className="border-2 border-[#020817] w-8 h-8">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        ))}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border-2 border-[#020817] text-[10px] font-bold text-slate-400">
                            +12
                        </div>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">12 students joined this week</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Active Students', value: '1,284', change: '+5.2%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Courses Published', value: '14', change: '0%', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Avg. Course Rating', value: '4.8', change: '+0.1', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg)}>
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                {stat.change !== '0%' && (
                                    <Badge variant="outline" className={cn(
                                        "bg-slate-800/50 border-slate-700/50 px-2 py-0.5 pointer-events-none",
                                        stat.change.startsWith('+') ? "text-emerald-400" : "text-amber-400"
                                    )}>
                                        {stat.change}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 text-white group-hover:scale-[1.02] origin-left transition-transform">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-white">Revenue Performance</CardTitle>
                            <CardDescription className="text-slate-500">Monthly earnings comparison for the current year</CardDescription>
                        </div>
                        <select className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none text-slate-300 focus:ring-1 focus:ring-indigo-500">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#1e293b',
                                        borderRadius: '12px',
                                        color: '#f1f5f9'
                                    }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recently Purchased */}
                <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Recent Sales</CardTitle>
                            <Button variant="link" className="text-indigo-400 hover:text-indigo-300 p-0 h-auto text-xs font-semibold uppercase tracking-wider">
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentStudents.map((student) => (
                                <div key={student.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border border-slate-800 ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white leading-none mb-1 truncate max-w-[120px] md:max-w-none">{student.name}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-[120px] md:max-w-none">{student.course}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white mb-1">{student.amount}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{student.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-400" />
                            Popular Courses
                        </h2>
                        <Button variant="outline" className="text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl gap-2 active:scale-95 transition-all text-xs h-9">
                            More Courses
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {topCourses.map((course) => (
                            <Card key={course.id} className="group overflow-hidden bg-slate-900/40 border-slate-800/80 backdrop-blur-sm hover:translate-y-[-4px] transition-all duration-300">
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 rounded-lg font-bold gap-2">
                                            <Play className="fill-current w-3 h-3" />
                                            View Analytics
                                        </Button>
                                    </div>
                                    <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border-slate-700/50 text-[10px] py-0.5 px-2">
                                        {course.rating} ★
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-bold text-white line-clamp-1 mb-3 group-hover:text-indigo-400 transition-colors">{course.name}</h4>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Sales</span>
                                            <span className="text-sm font-bold text-white">{course.sales}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Revenue</span>
                                            <span className="text-sm font-bold text-indigo-400">{course.revenue}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Go Live Now</CardTitle>
                            <CardDescription className="text-indigo-200">Start a live Q&A session with your students in one click.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Button className="w-full bg-white text-indigo-600 hover:bg-slate-100 rounded-xl font-bold gap-2 shadow-lg active:scale-95 transition-all">
                                <Play className="fill-current w-4 h-4" />
                                Go Live
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { task: 'New lesson for Next.js', date: 'Tomorrow', icon: Clock },
                                { task: 'Update Course Handouts', date: 'Fri, 20 Mar', icon: Clock },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800/60 transition-colors group cursor-pointer">
                                    <div className="p-2 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                                        <task.icon className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 truncate">{task.task}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{task.date}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-slate-500 hover:text-white hover:bg-slate-800/50 h-8 text-[11px] font-bold uppercase tracking-wider rounded-lg">
                                <Plus className="w-3 h-3 mr-1" />
                                Add New Task
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
