import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Video, ListVideo, BookOpen,
  Tag, Settings, LogOut, Menu, X, Bell, Sun, Moon,
  GraduationCap, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/admin/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils'
import { Button, Badge } from '@/admin/components/ui'
import { Separator } from '@/components/ui/separator'

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

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-500',
        mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        {(mobile || sidebarOpen) && (
          <span className="font-bold text-sm">
            VaultLearn <span className="text-primary">Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold group transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-primary hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300 group-hover:scale-110",

                    // ACTIVE
                    isActive && "text-white",

                    // DEFAULT
                    !isActive && "text-primary dark:text-white",

                    // HOVER
                    "group-hover:text-white"
                  )}
                />
                {(mobile || sidebarOpen) && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition" />
          {(mobile || sidebarOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-background">
      
      {/* Sidebar */}
      <div className="hidden lg:flex relative">
        <Sidebar />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-card border rounded-full flex items-center justify-center hover:bg-primary hover:text-white"
        >
          {sidebarOpen
            ? <ChevronLeft className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <Sidebar mobile />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-end h-16 px-6 border-b">
          
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-primary hover:text-white"
          >
            <Menu className="w-6 h-6 text-primary dark:text-white group-hover:text-white" />
          </button>

          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggle} className="group hover:bg-primary hover:text-white">
              {isDark ? (
                <Sun className="w-5 h-5 text-primary dark:text-white group-hover:text-white transition" />
              ) : (
                <Moon className="w-5 h-5 text-primary dark:text-white group-hover:text-white transition" />
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="group hover:bg-primary hover:text-white">
              <Bell className="w-5 h-5 text-primary dark:text-white group-hover:text-white transition" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="text-sm font-medium">
              {displayName}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}