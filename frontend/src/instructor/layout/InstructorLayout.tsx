import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    PieChart,
    Settings,
    Bell,
    Search,
    LogOut,
    ChevronRight,
    PlusCircle,
    ExternalLink,
    Plus,
    FileVideo
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/auth/store/authStore'

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
    { icon: FileVideo, label: 'Videos', path: '/instructor/videos' },
    { icon: Users, label: 'Students', path: '/instructor/students' },
    { icon: MessageSquare, label: 'Messages', path: '/instructor/messages' },
    { icon: PieChart, label: 'Analytics', path: '/instructor/analytics' },
    { icon: Settings, label: 'Settings', path: '/instructor/settings' },
]

export default function InstructorLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-[#020817] text-slate-200 selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="flex relative z-10">
                {/* Sidebar */}
                <aside className="w-64 h-screen sticky top-0 border-r border-slate-800/50 bg-[#020817]/80 backdrop-blur-xl hidden md:flex flex-col">
                    <div className="p-6">
                        <Link to="/instructor/dashboard" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                V
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                VaultLearn
                            </span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-indigo-500/10 text-indigo-400 font-medium"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="absolute left-[-1rem] w-1.5 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 mt-auto">
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl p-4 border border-indigo-500/20">
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Upgrade Pro</p>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">Get advanced analytics and premium course tools.</p>
                            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                                Upgrage Now
                            </Button>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 mt-4 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full group"
                        >
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Header */}
                    <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020817]/40 backdrop-blur-md sticky top-0 z-20">
                        <div className="relative max-w-md w-full hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search courses, students..."
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white rounded-full">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020817]" />
                            </Button>

                            <div className="h-8 w-px bg-slate-800 mx-1" />

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-800/50 p-1.5 rounded-full transition-all pr-3 outline-none cursor-pointer">
                                    <Avatar className="w-8 h-8 rounded-full border border-slate-700">
                                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'Instructor'}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user?.role || 'Instructor'}</p>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-800" />
                                    <DropdownMenuItem className="hover:bg-slate-800">Profile</DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-slate-800">Billing</DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-slate-800">Settings</DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-800" />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 cursor-pointer">Log out</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={() => navigate('/instructor/courses')} className="hidden sm:flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                <PlusCircle className="w-4 h-4" />
                                Create Course
                            </Button>
                        </div>
                    </header>

                    <div className="p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
