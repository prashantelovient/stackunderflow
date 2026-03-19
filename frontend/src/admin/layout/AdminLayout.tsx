import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Video, ListVideo, BookOpen,
  Tag, Settings, LogOut, Menu, X, Bell, Sun, Moon, GraduationCap, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/admin/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils'
import { Button, Badge } from '@/admin/components/ui'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/courses', icon: ListVideo, label: 'Courses' },
  { to: '/admin/blogs', icon: BookOpen, label: 'Blogs' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { admin, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const displayName = admin?.name || admin?.email || 'Admin'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-500 ease-in-out z-50',
        mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-sidebar-border/50">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform hover:rotate-6 transition-transform">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        {(mobile || sidebarOpen) && (
          <div className="flex flex-col">
            <span className="font-extrabold text-sidebar-foreground text-sm tracking-tight">
              VaultLearn <span className="text-primary italic">Admin</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-primary-foreground' : 'text-primary/60')} />
                {(mobile || sidebarOpen) && <span className="tracking-wide uppercase text-[11px]">{label}</span>}
                {isActive && !mobile && !sidebarOpen && (
                  <div className="absolute left-0 w-1 h-6 bg-white rounded-full translate-y-[-50%] top-1/2" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile/Actions */}
      <div className="p-4 border-t border-sidebar-border/50 space-y-4">
        <div className={cn("flex items-center gap-3 px-2", (sidebarOpen || mobile) ? "" : "justify-center")}>
          <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-inner">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{avatarInitial}</AvatarFallback>
          </Avatar>
          {(sidebarOpen || mobile) && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-sidebar-foreground truncate uppercase">{displayName}</p>
              <p className="text-[10px] text-sidebar-foreground/40 font-bold truncate">SYSTEM ADMINISTRATOR</p>
            </div>
          )}
        </div>

        <Separator className="bg-sidebar-border/30" />

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all group",
            (sidebarOpen || mobile) ? "" : "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          {(mobile || sidebarOpen) && <span>Sign Out Portal</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TooltipProvider>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col h-full relative group/sidebar">
          <Sidebar />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-24 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-primary hover:text-white transition-all z-[60] focus:outline-none"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative flex h-full animate-in slide-in-from-left duration-500">
              <Sidebar mobile />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-6 right-[-50px] w-10 h-10 bg-card/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-6 lg:px-10 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-6">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold tracking-tight uppercase text-[12px] text-muted-foreground tracking-[0.2em] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Administrative Console
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search / Global Cmd (Mockup) */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl text-xs font-bold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-all">
                <span className="opacity-50">SEARCH COMMANDS</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 min-w-[24px] justify-center ml-2 border-border/50">CMD + K</Badge>
              </div>

              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group border border-transparent hover:border-primary/20"
              >
                {isDark ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-glow" />
              </Button>

              <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block opacity-30" />

              <div className="hidden sm:flex items-center gap-3 group cursor-pointer hover:bg-muted/30 p-1.5 rounded-2xl transition-all">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none mb-0.5 tracking-tight">{displayName}</p>
                  <Badge variant="secondary" className="text-[8px] h-4 font-extrabold bg-primary/20 text-primary border-none tracking-widest px-1.5">ROOT</Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Overflow */}
          <main className="flex-1 overflow-y-auto bg-muted/20 custom-scrollbar">
            <div className="max-w-[1440px] mx-auto p-6 lg:p-10">
              <Outlet />
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  )
}

