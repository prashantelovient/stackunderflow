import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, User, LogOut, Menu, X,
  Sun, Moon, GraduationCap, PlaySquare, Bell, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useStudentAuthStore } from '@/store/studentAuthStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/utils'

const navItems = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/courses', icon: PlaySquare, label: 'My Courses' },
  { to: '/student/blogs', icon: BookOpen, label: 'Blogs' },
  { to: '/student/profile', icon: User, label: 'Profile' },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { student, logout } = useStudentAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = student?.name || student?.email || 'Student'
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
        'bg-[#0f0f23] border-r border-white/5',
        mobile ? 'w-72' : sidebarOpen ? 'w-72' : 'w-[68px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {(mobile || sidebarOpen) && (
          <div>
            <span className="font-bold text-white text-[15px] leading-none">VideoLearn</span>
            <span className="block text-xs text-violet-400 font-medium leading-none mt-0.5">Pro</span>
          </div>
        )}
      </div>

      {/* Student info */}
      {(mobile || sidebarOpen) && (
        <div className="mx-3 my-4 rounded-xl bg-white/5 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {avatarInitial}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{student?.email || ''}</p>
          </div>
        </div>
      )}
      {!(mobile || sidebarOpen) && (
        <div className="mx-auto my-4 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
          {avatarInitial}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {(mobile || sidebarOpen) && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-3 mb-2">
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
                  ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-400 border border-violet-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-violet-400' : '')} />
                {(mobile || sidebarOpen) && (
                  <>
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-violet-400/70" />}
                  </>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300'
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {(mobile || sidebarOpen) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#08081a]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
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
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 py-3.5 bg-[#0f0f23]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">VideoLearn Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
            </button>
            {/* Student profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10 ml-1">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {avatarInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-none">{displayName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
