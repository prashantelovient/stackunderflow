import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, User, LogOut, Menu, X,
  Sun, Moon, GraduationCap, PlaySquare, Bell, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/auth/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import ChatWidget from '@/components/Chat/ChatWidget'

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: PlaySquare, label: 'My Courses' },
  { to: '/student/blogs', icon: BookOpen, label: 'Blogs' },
  { to: '/student/profile', icon: User, label: 'Profile' },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = user?.name || user?.email || 'Student'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get current page title
  const currentNav = navItems.find(n => location.pathname.startsWith(n.to))
  const pageTitle = currentNav?.label || 'Learning'

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 ease-in-out',
        'bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-[68px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border h-[68px]">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {(mobile || sidebarOpen) && (
          <div>
            <span className="font-bold text-foreground text-[15px] leading-none">VideoLearn</span>
            <span className="block text-xs text-amber-500 dark:text-amber-400 font-medium leading-none mt-0.5">Pro</span>
          </div>
        )}
      </div>

      {/* Student info */}
      {(mobile || sidebarOpen) && (
        <div className="mx-3 my-4 rounded-xl bg-muted/60 px-4 py-3 flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-border/50">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white text-sm font-bold">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
      )}
      {!(mobile || sidebarOpen) && (
        <div className="mx-auto my-4">
          <Avatar className="w-9 h-9 border border-border/50">
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white text-sm font-bold">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-none">
        {(mobile || sidebarOpen) && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Navigation
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-amber-600 dark:text-amber-400' : '')} />
                {(mobile || sidebarOpen) && (
                  <>
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                  </>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Separator className="opacity-20 mx-3 w-auto" />

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            'text-destructive hover:bg-destructive/10'
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {(mobile || sidebarOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex h-full">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border h-[68px]">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              <Menu className={cn("w-5 h-5 transition-transform", sidebarOpen ? "rotate-180" : "")} />
            </Button>
            <div>
              <h1 className="text-base font-semibold">{pageTitle}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">VideoLearn Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              title="Toggle dark mode"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </Button>
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </Button>
            {/* Student profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-border ml-1">
              <Avatar className="w-8 h-8 border border-border/50">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white text-[10px] font-bold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
        <ChatWidget />
      </div>
    </div>
  )
}

